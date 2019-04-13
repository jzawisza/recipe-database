import { TOGGLE_SEARCH_TAB_ONLY_FAVORITES, SET_SEARCH_BY, SET_SEARCH_KEYWORDS } from '../actions/actionTypes';

const SEARCH_ANY = 'any';

const initialState = {
    showOnlyFavorites: false,
    searchBy: SEARCH_ANY
};

export function searchTab(state = initialState, action) {
    switch(action.type) {
        case TOGGLE_SEARCH_TAB_ONLY_FAVORITES:
            return Object.assign({}, state, { showOnlyFavorites: !state.showOnlyFavorites });
        case SET_SEARCH_BY:
        case SET_SEARCH_KEYWORDS:
            return Object.assign({}, state, {...action.payload});            
        default:
            return state;
    }
}