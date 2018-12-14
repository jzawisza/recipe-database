import {
    ADD_TAG,
    CLEAR_TAGS,
    INITIALIZE_NEW_RECIPE,
    MODIFY_RECIPE,
    CLEAR_RECIPE
} from './actionTypes';
import { doPost, doPatch, isErrorResponse, getErrMsg, getErrCode } from '../utils/AjaxUtils';

// Helper function to create an error object
function createErrorObject(type, status, errMsg, otherProps = {}) {
    let errStatus = { status, errMsg };
    let payload = Object.assign(errStatus, otherProps);
    return { type, payload, error: true };
}

// Add a tag to the store
export function addTag(tag) {
    return {
        type: ADD_TAG,
        payload: {
            tagId: tag.id,
            tagName: tag.name
        }
    }
}

// Clear all tags from the store
export function clearTags() {
    return {
        type: CLEAR_TAGS
    }
}

// Generate a new recipe when first visiting the Add Recipe page
// that contains empty strings for all non-nullable fields
export function createNewRecipe() {
    return {
        type: INITIALIZE_NEW_RECIPE
    }
}

// Upsert new recipe information into the database
export function modifyRecipe(key, newValue, id) {
    return function(dispatch, getState) {
        let recipe = {};
        let recipeUpdate = {};
        recipeUpdate[key] = newValue;
        // If we don't have an ID, we haven't created the initial recipe on the server,
        // so create a new object with all needed fields.
        // This new object is fetched from the reducer.
        if(!id) {
            recipe = Object.assign({}, getState().editRecipe.recipe, recipeUpdate);
        }
        else {
            recipe = recipeUpdate;
        }

        let urlPromise = undefined;
        // Do a POST for initial creation, and a PATCH for subsequent updates
        if (id) {
            urlPromise = doPatch(`recipes/${id}`, recipe);
        }
        else {
            urlPromise = doPost('recipes', recipe);
        }
        return urlPromise
        .then(responseJson => {
            dispatch(receiveModifyStatus(responseJson, recipe));
        });
    };
}

// Clear existing recipe data from the store
export function clearRecipe() {
    return {
        type: CLEAR_RECIPE
    }
}

// Helper function to do pure action creation for recipe modification
function receiveModifyStatus(responseJson, recipe) {
    if(isErrorResponse(responseJson)) {
        return createErrorObject(MODIFY_RECIPE, getErrCode(responseJson), getErrMsg(responseJson), recipe);
    }
    else {
        return {
            type: MODIFY_RECIPE,
            payload: { recipe: responseJson }
        }
    }
}