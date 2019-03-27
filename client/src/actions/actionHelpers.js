import { FAVORITE_TYPE_STR } from '../App';

const CURRENT_PAGE_KEY = 'currentPage';

// Constants for fetch recipe sort order
export const ORDER_ASC = 1;
export const ORDER_DESC = -1;

// Construct a JSON object representing the sort and paging parameters for fetch recipe queries.
// The caller should pass null for any values that should remain unchanged.
export function buildFetchRecipeParamJson(order, orderBy, rowsPerPage, currentPage, onlyFavorites, searchBy, searchKeywords) {
    let paramJson = {};
    if(order) {
        Object.assign(paramJson, { order });
    }
    if(orderBy) {
        Object.assign(paramJson, { orderBy });
    }
    if(rowsPerPage) {
        Object.assign(paramJson, { rowsPerPage });
    }
    // This value can be zero, so it's okay to assign it even if it's undefined
    paramJson[CURRENT_PAGE_KEY] = currentPage;

    if(onlyFavorites) {
        Object.assign(paramJson, { withSavedRecipes: FAVORITE_TYPE_STR });
    }
    if(searchBy) {
        Object.assign(paramJson, { searchBy });
    }
    // The empty string is a valid value here
    if(searchKeywords || searchKeywords === "") {
        Object.assign(paramJson, { searchKeywords });
    }

    return paramJson;
}