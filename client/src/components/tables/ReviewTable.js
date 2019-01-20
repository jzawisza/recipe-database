import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import TableCell from '@material-ui/core/TableCell';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import RemoveShoppingCartIcon from '@material-ui/icons/RemoveShoppingCart';
import SortablePaginatedTable from './SortablePaginatedTable';

const HEADER_ROWS = [
    { id: 'title', numeric: false, disablePadding: true, label: 'Title', sortable: true }
];
  
class ReviewTable extends Component {
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

    getDataHelper(sortField, sortAsc, rowsToShow, skipRows, type) {
        return {};
    }

    getFavorites(sortField = 'title', sortAsc = true, rowsToShow = 10, skipRows = 0) {
        return this.getDataHelper(sortField, sortAsc, rowsToShow, skipRows, 'FAVORITES');
    }

    getMealPlannerRecipes(sortField = 'title', sortAsc = true, rowsToShow = 10, skipRows = 0) {
        return this.getDataHelper(sortField, sortAsc, rowsToShow, skipRows, 'MEAL_PLANNER');
    }

    render() {
        const { isMealPlanner } = this.props;

        return (
            <SortablePaginatedTable
                headerRows={HEADER_ROWS}
                order={1}
                orderBy='title'
                rowsPerPage={10}
                currentPage={0}
                dataFunc={isMealPlanner ? this.getMealPlannerRecipes : this.getFavorites}
                rowRenderFunc={this.renderRow}
                title={isMealPlanner ? 'Meal Planner' : 'Favorites'}
                removeLabel={isMealPlanner ? 'Remove from Meal Planner' : 'Remove from Favorites'}
                removeIcon={isMealPlanner ? <RemoveShoppingCartIcon /> : <FavoriteBorderIcon />}
            />
        );
    }
}

export default ReviewTable;