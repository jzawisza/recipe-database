import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import TableCell from '@material-ui/core/TableCell';
import DeleteIcon from '@material-ui/icons/Delete';
import CircularProgress from '@material-ui/core/CircularProgress';
import SortablePaginatedTable from './SortablePaginatedTable';
import { fetchRecipes, clearRecipesCache } from '../../actions/actions';
import { ORDER_ASC, buildFetchRecipeParamJson, addOnlyFavoritesToFetchRecipeParamJson } from '../../actions/actionHelpers';


const HEADER_ROWS = [
    { id: 'title', numeric: false, disablePadding: true, label: 'Title', sortable: true },
    { id: 'source', numeric: false, disablePadding: false, label: 'Source', sortable: true },
    { id: 'serves', numeric: true, disablePadding: false, label: 'Serves', sortable: true },
    { id: 'tags', numeric: false, disablePadding: false, label: 'Tags', sortable: false },
    { id: 'modified_time', numeric: false, disablePadding: false, label: 'Last Modified', sortable: true },
];

const INITIAL_ORDER = ORDER_ASC;
const INITIAL_ORDER_BY = 'title';
const INITIAL_ROWS_PER_PAGE = 10;
const INITIAL_PAGE = 0;
const INITIAL_FETCH_PARAMS_JSON = {
  order: INITIAL_ORDER,
  orderBy: INITIAL_ORDER_BY,
  rowsPerPage: INITIAL_ROWS_PER_PAGE,
  currentPage: INITIAL_PAGE
}
            
class RecipeTable extends Component {
    state = {
      loading: true
    };

    componentDidMount() {
      this.reloadRecipesFromServer(INITIAL_FETCH_PARAMS_JSON, this.props.onlyFavorites);
    }

    componentDidUpdate(prevProps) {
      const { order, orderBy, rowsPerPage, currentPage, onlyFavorites } = this.props;
      if(prevProps.onlyFavorites !== onlyFavorites) {
        let fetchParamJson = buildFetchRecipeParamJson(order, orderBy, rowsPerPage, currentPage);
        this.reloadRecipesFromServer(fetchParamJson, onlyFavorites);
      }
    }

    // Helper function to load data from the Redux store
    reloadRecipesFromServer(fetchParamJson, onlyFavorites) {
      let newFetchParamJson = {};
      if(onlyFavorites) {
        newFetchParamJson = addOnlyFavoritesToFetchRecipeParamJson(fetchParamJson);
      }
      else {
        newFetchParamJson = fetchParamJson;
      }

      let funcReturn = this.props.fetchRecipes(newFetchParamJson);
      // See comment in ReviewTable for explanation of this pattern
      if(funcReturn) {
        funcReturn.then(() => {
          this.setState({
            loading: false
          })
        });
      }
      else {
        this.setState({
          loading: false
        });
      }
    }

    // Sort tags alphabetically by name
    tagSortFunc(a, b) {
      if(b.name < a.name) {
        return 1;
      }
      else if(b.name > a.name) {
        return -1;
      }
      else {
        return 0;
      }
    }

    // Take tag data from JSON payload and convert it to alphabetized comma-delimited string
    processTags = data => {
      let tagStr = '';
      if(data.tags) {
        let sortedTags = data.tags.sort(this.tagSortFunc);
        sortedTags.forEach(function(tagInfo) {
          tagStr += tagInfo.name + ', ';
        });
        // Remove the trailing newlines
        let tagsLen = tagStr.length;
        tagStr = tagStr.substring(0, tagsLen - 2);
      }

      return tagStr;
    };

    // Render a row in the recipe table
    renderRecipeRow = row => {
      return (
        <React.Fragment>
          <TableCell component="th" scope="row" padding="none">
            <Link to={`/recipes/${row.id}`}>
              {row.title}
            </Link>
          </TableCell>
          <TableCell>{row.source}</TableCell>
          <TableCell numeric>{row.serves}</TableCell>
          <TableCell>{this.processTags(row.data)}</TableCell>
          <TableCell>
          <Moment format="YYYY-MM-DD h:mm A">
            {row.modified_time}
          </Moment>
          </TableCell>
        </React.Fragment>
      );
    };

    render() {
      const { order, orderBy, rowsPerPage, currentPage, totalRows, dataRows, fetchRecipes, onlyFavorites } = this.props;

      if(this.state.loading) {
        return (
          <CircularProgress
            size={200}
          />
        );
      }
      return (
        <SortablePaginatedTable
          headerRows={HEADER_ROWS}
          dataRows={dataRows}
          dataProviderFunc={fetchRecipes}
          rowRenderFunc={this.renderRecipeRow}
          order={order}
          orderBy={orderBy}
          rowsPerPage={rowsPerPage}
          currentPage={currentPage}
          totalRows={totalRows}
          title='Recipes'
          removeLabel='Delete'
          removeIcon={<DeleteIcon />}
          removeModalTitle='Delete selected recipes from database?'
          removeModalButtonName='Delete'
          removeAPI='recipes'
          clearCacheFunc={clearRecipesCache}
          onlyFavorites={onlyFavorites}
        />
      );
    }
}

RecipeTable.propTypes = {
  fetchRecipes: PropTypes.func.isRequired,
  clearRecipesCache: PropTypes.func.isRequired,
  dataRows: PropTypes.array.isRequired,
  order: PropTypes.number.isRequired,
  orderBy: PropTypes.string.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  totalRows: PropTypes.number.isRequired,
  onlyFavorites: PropTypes.bool.isRequired
};

const mapStateToProps = (state) => {
  const { data, order, orderBy, rowsPerPage, currentPage, totalRows } = state.fetchRecipes;
  return { order, orderBy, rowsPerPage, currentPage, totalRows, dataRows: data };
}
  
export default (connect(mapStateToProps, { fetchRecipes, clearRecipesCache }))(RecipeTable);