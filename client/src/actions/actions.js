import {
    ADD_TAG,
    CLEAR_TAGS,
    FETCH_TAGS,
    DELETE_TAG,
    MODIFY_RECIPE,
    CLEAR_RECIPE,
    FETCH_RECIPES
} from './actionTypes';
import { doPost, doPatch, isErrorResponse, getErrMsg, getErrCode, doGet } from '../utils/AjaxUtils';
import qs from 'qs';

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

// Upsert new recipe information into the database
export function modifyRecipe(key, newValue, id) {
    return function(dispatch, getState) {
        // Check to see if we have all required fields, and if we do, upsert the recipe information
        // into the database.
        // If not, update the local state, but don't persist anything to the database until
        // we have the required fields.
        let recipeUpdate = {};
        recipeUpdate[key] = newValue;
        let { recipe } = getState().editRecipe;
        let newRecipe = Object.assign({}, recipe, recipeUpdate);
        if(newRecipe.title && newRecipe.ingredients && newRecipe.preparation) {
            // We have all required fields: do the update to the database
            let urlPromise = undefined;
            // Do a POST for initial creation, and a PATCH for subsequent updates
            if (id) {
                urlPromise = doPatch(`recipes/${id}`, recipeUpdate);
            }
            else {
                urlPromise = doPost('recipes', newRecipe);
            }
            return urlPromise
            .then(responseJson => {
                dispatch(receiveModifyStatus(responseJson));
            });
        }
        else {
            // Not all required fields present: just update the local store
            dispatch(receiveModifyStatus(recipeUpdate));
        }
    };
}

// Clear existing recipe data from the store
export function clearRecipe() {
    return {
        type: CLEAR_RECIPE
    }
}

// Helper function to do pure action creation for recipe modification
function receiveModifyStatus(responseJson) {
    if(isErrorResponse(responseJson)) {
        return createErrorObject(MODIFY_RECIPE, getErrCode(responseJson), getErrMsg(responseJson));
    }
    else {
        return {
            type: MODIFY_RECIPE,
            payload: { recipe: responseJson }
        }
    }
}

export function fetchRecipes(fetchParamJson) {
    let { order, orderBy, rowsPerPage, currentPage } = fetchParamJson;

    return function(dispatch, getState) {
        let state = getState().fetchRecipes;
        // Create a new object that combines the requested changes with the previous state
        const paramsFromState = (({ order, orderBy, rowsPerPage, currentPage }) => ({ order, orderBy, rowsPerPage, currentPage } ))(state);
        let newFetchParamJson = Object.assign(paramsFromState, fetchParamJson);

        // If we have results and the method parameters are unchanged from the previous call to this function,
        // return the stored results
        if(state.data.length > 0 && state.order === order && state.orderBy === orderBy && state.rowsPerPage === rowsPerPage && state.currentPage === currentPage) {
            dispatch(createFetchAction(state.data, state.data.length, newFetchParamJson));
        }
        // Otherwise, reload the data from the server
        else {
            let fields = ['id', 'title', 'source', 'serves', 'data', 'modified_time'];
            let url = generateFetchUrl('recipes', fields, newFetchParamJson);
            return(doGet(url).then(responseJson => {
                dispatch(createFetchAction(responseJson.data, responseJson.total, newFetchParamJson));
                })
            );    
        }
    }
}

function createFetchAction(data, totalRows, fetchParamJson) {
    let payloadValue = Object.assign({ data, totalRows }, fetchParamJson);
    return {
        type: FETCH_RECIPES,
        payload: payloadValue
    }
}

function generateFetchUrl(table, fields, fetchParamJson) {
    // https://github.com/ljharb/qs
    let { order, orderBy, rowsPerPage, currentPage } = fetchParamJson;
    let sortObj = {};
    sortObj[orderBy] = order;
    let obj = {
        '$select': fields,
        '$sort': sortObj,
        '$limit': rowsPerPage,
        '$skip': currentPage * rowsPerPage
    };
    return `${table}?${qs.stringify(obj)}`;
}