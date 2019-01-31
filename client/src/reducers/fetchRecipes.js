import {
    FETCH_RECIPES, FETCH_FAVORITES, FETCH_MEAL_PLANNER
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
            let newObj = Object.assign({}, state, {...action.payload});
            // If we deselect showing only favorites on the Search tab,
            // don't keep the key related to that in the state
            if(!action.payload.withSavedRecipes) {
                delete newObj.withSavedRecipes;
            }
            return newObj;
        default:
            return state;
    }
}

export function fetchFavorites(state = initialState, action) {
    switch(action.type) {
        case FETCH_FAVORITES:
            return Object.assign({}, state, {...action.payload});
        default:
            return state;
    }
}

export function fetchMealPlannerRecipes(state = initialState, action) {
    switch(action.type) {
        case FETCH_MEAL_PLANNER:
            return Object.assign({}, state, {...action.payload});
        default:
            return state;
    }
}