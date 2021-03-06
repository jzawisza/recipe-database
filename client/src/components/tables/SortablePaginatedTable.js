import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import SharedTableHead from './SharedTableHead';
import SharedTableToolbar from './SharedTableToolbar';
import { buildFetchRecipeParamJson, ORDER_ASC, ORDER_DESC } from '../../actions/actionHelpers';

// NOTE: this code is adapted from the Material UI table samples at
// https://material-ui.com/demos/tables/

const styles = theme => ({
    root: {
      width: '75%',
      marginTop: theme.spacing.unit * 3,
    }
});
  
class SortablePaginatedTable extends Component {
    state = {
      selected: [],
      loading: false
    };

    handleRequestSort = (event, property) => {
      const orderBy = property;
      // Default to descending sort
      let order = ORDER_DESC;
      if (this.props.orderBy === orderBy) {
        // If we're clicking on a column we already clicked on before, toggle
        // the sort order
        order = (this.props.order === ORDER_DESC) ? ORDER_ASC : ORDER_DESC;
      }
  
      let fetchParamJson = buildFetchRecipeParamJson(order, orderBy, null, null, this.props.onlyFavorites, null, null);
      this.updateDataRows(fetchParamJson);
    };

    handleSelectAllClick = event => {
      if (event.target.checked) {
        this.setState(state => ({ selected: this.props.dataRows.map(n => n.id) }));
      }
      else {
        this.setState({ selected: [] });
      }
    };
  
    handleSelectForRemoval = (e, id) => {
      const { selected } = this.state;
      const selectedIndex = selected.indexOf(id);
      let newSelected = [];
  
      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, id);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selected.slice(0, selectedIndex),
          selected.slice(selectedIndex + 1),
        );
      }
  
      this.setState({ selected: newSelected });
    };
  
    handleChangePage = (event, currentPage) => {
      let fetchParamJson = buildFetchRecipeParamJson(null, null, null, currentPage, this.props.onlyFavorites, null, null);
      this.updateDataRows(fetchParamJson);
    };
  
    handleChangeRowsPerPage = (event) => {
      const rowsPerPage = event.target.value;
      // Start at page 0 if we change the number of rows per page
      let fetchParamJson = buildFetchRecipeParamJson(null, null, rowsPerPage, 0, this.props.onlyFavorites, null, null);
      this.updateDataRows(fetchParamJson);
    };

    updateDataRows = fetchParamJson => {
      this.setState(state => {
        return { loading: true };
      });
      this.props.dataProviderFunc(fetchParamJson)
      .then(() => {
        // Clear the selected rows if we change what's being displayed
        this.setState(state => {
          return { selected: [], loading: false };
        });
      });
    }
  
    isSelected = id => this.state.selected.indexOf(id) !== -1;
  
    render() {
      const { classes, title, removeLabel, removeIcon, removeModalTitle, removeModalButtonName, removeAPI, clearCacheFunc,
        headerRows, dataRows, rowRenderFunc, order, orderBy, currentPage, rowsPerPage, totalRows } = this.props;
      const { selected, loading } = this.state;
      const emptyRows = rowsPerPage - dataRows.length;

      return (
        <Paper className={classes.root}>
          <SharedTableToolbar
            selected={selected}
            title={title}
            removeLabel={removeLabel}
            removeIcon={removeIcon}
            removeModalTitle={removeModalTitle}
            removeModalButtonName={removeModalButtonName}
            removeAPI={removeAPI}
            refreshFunc={this.updateDataRows}
            clearCacheFunc={clearCacheFunc}
          />
          <div className={classes.tableWrapper}>
            {loading
              ?
              <CircularProgress
                size={200}
              />
              :
              <Table className={classes.table} aria-labelledby="tableTitle">
                <SharedTableHead
                  headerRows={headerRows}
                  numSelected={selected.length}
                  order={order === ORDER_ASC ? 'asc' : 'desc'}
                  orderBy={orderBy}
                  onRequestSort={this.handleRequestSort}
                  rowCount={dataRows.length}
                  onSelectAllClick={this.handleSelectAllClick}
                />
                <TableBody>
                  {dataRows
                    .map(n => {
                      // If we're loading Favorites or Meal Planner recipes, use the ID
                      // from the saved-recipes table in the database to track what's selected,
                      // so we can delete from that table.
                      // Otherwise, use the ID from the recipes table.
                      let selectedId = n['savedRecipe.id'] ? n['savedRecipe.id'] : n.id;
                      const isSelected = this.isSelected(selectedId);
                      return (
                        <TableRow
                          hover
                          onClick={event => this.handleSelectForRemoval(event, selectedId)}
                          role="checkbox"
                          aria-checked={isSelected}
                          tabIndex={-1}
                          key={selectedId}
                          selected={isSelected}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox checked={isSelected} />
                          </TableCell>
                          {rowRenderFunc(n)}
                        </TableRow>
                      )})}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 49 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            }
          </div>
          <TablePagination
            component="div"
            count={totalRows}
            rowsPerPage={rowsPerPage}
            page={currentPage}
            backIconButtonProps={{
              'aria-label': 'Previous Page',
            }}
            nextIconButtonProps={{
              'aria-label': 'Next Page',
            }}
            onChangePage={this.handleChangePage}
            onChangeRowsPerPage={this.handleChangeRowsPerPage}
          />
        </Paper>
      );
    }
  }
  
  SortablePaginatedTable.propTypes = {
    classes: PropTypes.object.isRequired,
    headerRows: PropTypes.array.isRequired,
    dataRows: PropTypes.array.isRequired,
    dataProviderFunc: PropTypes.func.isRequired,
    rowRenderFunc: PropTypes.func.isRequired,
    order: PropTypes.number.isRequired,
    orderBy: PropTypes.string.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
    currentPage: PropTypes.number.isRequired,
    totalRows: PropTypes.number.isRequired,
    searchBy: PropTypes.string,
    searchKeywords: PropTypes.string,
    title: PropTypes.string.isRequired,
    removeLabel: PropTypes.string.isRequired,
    removeIcon: PropTypes.element.isRequired,
    removeModalTitle: PropTypes.string.isRequired,
    removeModalButtonName: PropTypes.string.isRequired,
    removeAPI: PropTypes.string.isRequired,
    clearCacheFunc: PropTypes.func.isRequired,
    onlyFavorites: PropTypes.bool
};
  
export default withStyles(styles)(SortablePaginatedTable);