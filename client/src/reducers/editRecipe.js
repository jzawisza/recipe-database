import {
    MODIFY_RECIPE, CLEAR_RECIPE
} from '../actions/actionTypes';

const initialState = {
    recipe: null
}

export function editRecipe(state = initialState, action) {
    switch(action.type) {
        case MODIFY_RECIPE:
            return Object.assign({}, state, {
                recipe: Object.assign({}, state.recipe, action.payload.recipe)
            });
        case CLEAR_RECIPE:
            return initialState;
        default:
            return initialState;
    }
}