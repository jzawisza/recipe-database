import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import TableCell from '@material-ui/core/TableCell';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import RemoveShoppingCartIcon from '@material-ui/icons/RemoveShoppingCart';
import SortablePaginatedTable from '../components/tables/SortablePaginatedTable';

const HEADER_ROWS = [
    { id: 'title', numeric: false, disablePadding: true, label: 'Title' }
];

const MEAL_PLANNER_DATA = [
    { id: 1, title: "Beef Bolognese Ravioli" },
    { id: 2, title: "Tahini and Pepita Salad" },
    { id: 3, title: "Green Beans" }
];

const FAVORITES_DATA = [
    { id: 1, title: "Applesauce" },
    { id: 2, title: "Oven-Roasted Green Beans" },
    { id: 3, title: "Brussels Sprouts" }
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

    render() {
        const { isMealPlanner } = this.props;

        return (
            <SortablePaginatedTable
            order='asc'
            orderBy='title'
            rowsPerPage={10}
            data={isMealPlanner ? MEAL_PLANNER_DATA : FAVORITES_DATA}
            headerRows={HEADER_ROWS}
            rowRenderFunc={this.renderRow}
            title={isMealPlanner ? 'Meal Planner' : 'Favorites'}
            removeLabel={isMealPlanner ? 'Remove from Meal Planner' : 'Remove from Favorites'}
            removeIcon={isMealPlanner ? <RemoveShoppingCartIcon /> : <FavoriteBorderIcon />}
            />
        );
    }
}

export default ReviewTable;