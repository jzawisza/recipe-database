import {
    ADD_TAG,
    CLEAR_TAGS,
    FETCH_TAGS,
    DELETE_TAG,
    INITIALIZE_NEW_RECIPE,
    MODIFY_RECIPE,
    CLEAR_RECIPE
} from './actionTypes';
import { doPost, doPatch, isErrorResponse, getErrMsg, getErrCode, doGet } from '../utils/AjaxUtils';

// Helper function to create an error object
function createErrorObject(type, status, errMsg, otherProps = {}) {
    let errStatus = { status, errMsg };
    let payload = Object.assign(errStatus, otherProps);
    return { type, payload, error: true };
}

// Add a tag to the store
export function addTag(tag, recipeId) {
    // If we have a recipe ID, update the database with the new tag information
    if(recipeId) {
        return function(dispatch, getState) {
            let tagArray = getState().manageTags.tags.slice();
            tagArray.push(tag);
            let newData = {
                data: {
                    tags: tagArray
                }
            };
            return doPatch(`recipes/${recipeId}`, newData)
            .then(responseJson => {
                dispatch(createAddTagAction(tag.id, tag.name, responseJson));
            });
        }
    }
    else {
        return createAddTagAction(tag.id, tag.name);
    }
}

// Helper function for addTag
function createAddTagAction(id, name, response = {}) {
    if(isErrorResponse(response)) {
        return createErrorObject(ADD_TAG, getErrCode(response), getErrMsg(response));
    }
    else {
        return {
            type: ADD_TAG,
            payload: {
                tagId: id,
                tagName: name
            }
        }
    }
}

// Clear all tags from the store
export function clearTags() {
    return {
        type: CLEAR_TAGS
    }
}

// Fetch tag information from the database
export function fetchTags(id) {
    return function(dispatch) {
        if(id) {
            return doGet(`recipes/${id}?$select[]=data`)
            .then(responseJson => {
                dispatch(receiveTags(responseJson))
            });
        }
    }
}

// Helper function for fetchTags
function receiveTags(response) {
    if(isErrorResponse(response)) {
        return createErrorObject(FETCH_TAGS, getErrCode(response), getErrMsg(response));
    }
    else {
        return {
            type: FETCH_TAGS,
            payload: { tags: response.data.tags }
        }
    }
}

export function deleteTag(tag, recipeId) {
    if(recipeId) {
        return function(dispatch, getState) {
            let tagArray = getState().manageTags.tags;
            let tagToDeleteIndex = tagArray.indexOf(tag);
            tagArray.splice(tagToDeleteIndex, 1);

            let recipeData = {
                data: {
                    tags: tagArray
                }
            };
            return doPatch(`recipes/${recipeId}`, recipeData)
            .then(responseJson => {
                dispatch(createTagDeletedAction(tagArray, responseJson));
            });
        }
    }
}

// Helper function for deleteTag
function createTagDeletedAction(tagArray, response) {
    if(isErrorResponse(response)) {
        return createErrorObject(DELETE_TAG, getErrCode(response), getErrMsg(response));
    }
    else {
        return {
            type: DELETE_TAG,
            payload: { tags: tagArray }
        }
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