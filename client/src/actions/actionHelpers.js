import { FAVORITE_TYPE_STR } from '../App';

const ORDER_KEY = 'order';
const ORDER_BY_KEY = 'orderBy';
const ROWS_PER_PAGE_KEY = 'rowsPerPage';
const CURRENT_PAGE_KEY = 'currentPage';

// Constants for fetch recipe sort order
export const ORDER_ASC = 1;
export const ORDER_DESC = -1;

// Construct a JSON object representing the sort and paging parameters for fetch recipe queries.
// The caller should pass null for any values that should remain unchanged.
export function buildFetchRecipeParamJson(order, orderBy, rowsPerPage, currentPage) {
    let paramJson = {};
    if(order) {
        paramJson[ORDER_KEY] = order;
    }
    if(orderBy) {
        paramJson[ORDER_BY_KEY] = orderBy;
    }
    if(rowsPerPage) {
        paramJson[ROWS_PER_PAGE_KEY] = rowsPerPage;
    }
    // This value can be zero, so it's okay to assign it even if it's undefined
    paramJson[CURRENT_PAGE_KEY] = currentPage;

    return paramJson;
}

// Given a JSON object constructed by buildFetchRecipeParamJson above,
// add information to it telling the query to only return recipes marked as favorites
export function addOnlyFavoritesToFetchRecipeParamJson(fetchRecipeParamJson) {
    return Object.assign(fetchRecipeParamJson, { withSavedRecipes: FAVORITE_TYPE_STR });
}