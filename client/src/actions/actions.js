import {
    ADD_TAG,
    CLEAR_TAGS,
    FETCH_TAGS,
    DELETE_TAG,
    MODIFY_RECIPE,
    CLEAR_RECIPE,
    FETCH_RECIPES,
    FETCH_FAVORITES,
    FETCH_MEAL_PLANNER,
    TOGGLE_SEARCH_TAB_ONLY_FAVORITES,
    CLEAR_FAVORITES_CACHE,
    CLEAR_RECIPES_CACHE,
    CLEAR_MEAL_PLANNER_CACHE
} from './actionTypes';
import { doPost, doPatch, isErrorResponse, getErrMsg, getErrCode, doGet } from '../utils/AjaxUtils';
import { FAVORITE_TYPE_STR, MEAL_PLANNER_TYPE_STR } from '../App';
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
        let tagData = response.data.tags ? response.data.tags : [];
        return {
            type: FETCH_TAGS,
            payload: { tags: tagData }
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
export function modifyRecipe(key, newValue, id, isNewRecipe) {
    return function(dispatch, getState) {
        // Check to see if we have all required fields, and if we do, upsert the recipe information
        // into the database.
        // If not, update the local state, but don't persist anything to the database until
        // we have the required fields.
        let recipeUpdate = {};
        recipeUpdate[key] = newValue;
        let { recipe } = getState().editRecipe;
        let newRecipe = Object.assign({}, recipe, recipeUpdate);
        
        // Only update the database if one of the following are true:
        // 1) We have all required fields for a new recipe
        // 2) This is an existing recipe, i.e. it already has all required fields
        if(!isNewRecipe || (newRecipe.title && newRecipe.ingredients && newRecipe.preparation)) {
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

// Fetch recipes for Search tab
export function fetchRecipes(fetchParamJson) {
    let fields = ['id', 'title', 'source', 'serves', 'data', 'modified_time'];
    return fetchRecipesInternal(fields, FETCH_RECIPES, fetchParamJson);
}

// Fetch recipes for Favorites tab
export function fetchFavorites(fetchParamJson) {    
    return fetchSavedRecipes(fetchParamJson, false);
}

// Fetch recipes for Plan tabl
export function fetchMealPlannerRecipes(fetchParamJson) {
    return fetchSavedRecipes(fetchParamJson, true);
}

// Helper function to fetch any type of saved recipes
function fetchSavedRecipes(fetchParamJson, isMealPlanner) {
    let action = isMealPlanner ? FETCH_MEAL_PLANNER : FETCH_FAVORITES;
    return fetchRecipesInternal(['title'], action, fetchParamJson);
}

// Helper function for fetching recipe information
function fetchRecipesInternal(fields, action, fetchParamJson) {
    return function(dispatch, getState) {
        let state = undefined;
        switch(action) {
            case FETCH_RECIPES:
                state = getState().fetchRecipes;
                break;
            case FETCH_FAVORITES:
                state = getState().fetchFavorites;
                break;
            case FETCH_MEAL_PLANNER:
                state = getState().fetchMealPlannerRecipes;
                break;
            default:
                dispatch(createErrorObject(action));
        }

        // Create a new object that combines the requested changes with the previous state
        const paramsFromState = (({ order, orderBy, rowsPerPage, currentPage }) => ({ order, orderBy, rowsPerPage, currentPage } ))(state);
        let newFetchParamJson = Object.assign(paramsFromState, fetchParamJson);

        // If we have results and the method parameters are unchanged from the previous call to this function,
        // return the stored results
        if(state.data.length > 0 && fetchParamsUnchanged(state, fetchParamJson, action)) {
            dispatch(createFetchAction(action, state.data, state.data.length, newFetchParamJson));
        }
        // Otherwise, reload the data from the server
        else {
            // If we're fetching saved recipes, we need an additional query parameter
            if(action === FETCH_FAVORITES) {
                newFetchParamJson.withSavedRecipes = FAVORITE_TYPE_STR;
            }
            else if(action === FETCH_MEAL_PLANNER) {
                newFetchParamJson.withSavedRecipes = MEAL_PLANNER_TYPE_STR;
            }
            let url = generateFetchUrl(fields, newFetchParamJson);
            return(doGet(url).then(responseJson => {
                dispatch(createFetchAction(action, responseJson.data, responseJson.total, newFetchParamJson));
                })
            );    
        }
    }
}

function createFetchAction(action, data, totalRows, fetchParamJson) {
    let payloadValue = Object.assign({ data, totalRows }, fetchParamJson);
    return {
        type: action,
        payload: payloadValue
    }
}

function generateFetchUrl(fields, fetchParamJson) {
    // https://github.com/ljharb/qs
    let { order, orderBy, rowsPerPage, currentPage, withSavedRecipes } = fetchParamJson;
    let sortObj = {};
    sortObj[orderBy] = order;
    let obj = {
        '$select': fields,
        '$sort': sortObj,
        '$limit': rowsPerPage,
        '$skip': currentPage * rowsPerPage
    };
    if(withSavedRecipes) {
        obj.withSavedRecipes = withSavedRecipes;
    }
    return `recipes?${qs.stringify(obj)}`;
}

// Compare the sets of parameters passed to fetchRecipesInternal,
// and return true if they're identical
function fetchParamsUnchanged(stateJson, newJson, action) {
    // We only need to check if withSavedRecipes is identical if we're fetching all recipes.
    // For fetching just the Favorites or Meal Planner recipes, we manage that parameter internally,
    // so the check leads to incorrect results.
    let identicalWithSavedRecipes = true;
    if(action === FETCH_RECIPES) {
        identicalWithSavedRecipes = (stateJson.withSavedRecipes === newJson.withSavedRecipes);
    }
    return stateJson.order === newJson.order
        && stateJson.orderBy === newJson.orderBy
        && stateJson.rowsPerPage === newJson.rowsPerPage
        && stateJson.currentPage === newJson.currentPage
        && identicalWithSavedRecipes;
}

export function toggleSearchTabOnlyFavorites() {
    return {
        type: TOGGLE_SEARCH_TAB_ONLY_FAVORITES
    }
}

export function clearRecipesCache() {
    return {
        type: CLEAR_RECIPES_CACHE
    };
}

export function clearFavoritesCache() {
    return {
        type: CLEAR_FAVORITES_CACHE
    };
}

export function clearMealPlannerCache() {
    return {
        type: CLEAR_MEAL_PLANNER_CACHE
    };
}