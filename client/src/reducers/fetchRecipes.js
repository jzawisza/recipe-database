import {
    FETCH_RECIPES
} from '../actions/actionTypes';
import { ORDER_ASC } from '../actions/actionHelpers';

const initialState = {
    data: [],
    order: ORDER_ASC,
    orderBy: 'title',
    rowsPerPage: 10,
    currentPage: 0,
    totalRows: 0
}

export function fetchRecipes(state = initialState, action) {
    switch(action.type) {
        case FETCH_RECIPES:
            return Object.assign({}, state, {...action.payload});
        default:
            return state;
    }
}