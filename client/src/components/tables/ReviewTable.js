import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import TableCell from '@material-ui/core/TableCell';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import RemoveShoppingCartIcon from '@material-ui/icons/RemoveShoppingCart';
import SortablePaginatedTable from './SortablePaginatedTable';
import { fetchFavorites, fetchMealPlannerRecipes } from '../../actions/actions';
import { ORDER_ASC } from '../../actions/actionHelpers';

const HEADER_ROWS = [
    { id: 'title', numeric: false, disablePadding: true, label: 'Title', sortable: true }
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
  
class ReviewTable extends Component {
    state = {
        loading: true
    };

    componentDidMount() {
        // Load data from Redux store
        const { isMealPlanner, fetchFavorites, fetchMealPlannerRecipes } = this.props;
        const recipeFunc = isMealPlanner ? fetchMealPlannerRecipes : fetchFavorites;
        
        // This function returns a promise if we're loading from the database, but returns undefined
        // if we're loading from the cache.
        // If it returns a promise, wait for it to return before setting loading to false.
        // If it returns undefined, we didn't actually need to load anything,
        // so it's safe to immediately set loading to false.
        let funcReturn = recipeFunc(INITIAL_FETCH_PARAMS_JSON);
        if(funcReturn) {
            funcReturn.then(() => {
                this.setState({
                    loading: false
                });
            });
        }
        else {
            this.setState({
                loading: false
            });
        }
    }

    renderRow = row => {
        return (
            <React.Fragment>
              <TableCell component="th" scope="row" padding="none">
                <Link to={`/recipes/${row.id}`}>
                  {row.title}
                </Link>
              </TableCell>
            </React.Fragment>
        );
    };

    render() {
        const { isMealPlanner, order, orderBy, rowsPerPage, currentPage, totalRows, dataRows, fetchFavorites, fetchMealPlannerRecipes } = this.props;

        return (
            <SortablePaginatedTable
                headerRows={HEADER_ROWS}
                dataRows={dataRows}
                dataProviderFunc={isMealPlanner ? fetchMealPlannerRecipes : fetchFavorites}
                rowRenderFunc={this.renderRow}
                order={order}
                orderBy={orderBy}
                rowsPerPage={rowsPerPage}
                currentPage={currentPage}
                totalRows={totalRows}
                title={isMealPlanner ? 'Meal Planner' : 'Favorites'}
                removeLabel={isMealPlanner ? 'Remove from Meal Planner' : 'Remove from Favorites'}
                removeIcon={isMealPlanner ? <RemoveShoppingCartIcon /> : <FavoriteBorderIcon />}
            />
        );
    }
}

ReviewTable.propTypes = {
  fetchFavorites: PropTypes.func.isRequired,
  fetchMealPlannerRecipes: PropTypes.func.isRequired,
  dataRows: PropTypes.array.isRequired,
  order: PropTypes.number.isRequired,
  orderBy: PropTypes.string.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  totalRows: PropTypes.number.isRequired
};


const mapStateToProps = (state, ownProps) => {
    let recipeState = ownProps.isMealPlanner ? state.fetchMealPlannerRecipes : state.fetchFavorites;
    const { data, order, orderBy, rowsPerPage, currentPage, totalRows } = recipeState;
    return { order, orderBy, rowsPerPage, currentPage, totalRows, dataRows: data };
}

export default (connect(mapStateToProps, { fetchFavorites, fetchMealPlannerRecipes }))(ReviewTable);
