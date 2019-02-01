import { TOGGLE_SEARCH_TAB_ONLY_FAVORITES } from '../actions/actionTypes';

const initialState = {
    showOnlyFavorites: false
};

export function searchTabOnlyFavorites(state = initialState, action) {
    switch(action.type) {
        case TOGGLE_SEARCH_TAB_ONLY_FAVORITES:
            return { showOnlyFavorites: !state.showOnlyFavorites };
        default:
            return state;
    }
}