import fetch from 'cross-fetch';
import {
    IMPORT_RECIPE,
    GET_IMPORT_STATUS
} from './actionTypes';

const SERVER_URL = 'http://localhost:3030';

// Helper function to create an error object
function createErrorObject(type, status, errMsg, otherProps = {}) {
    let errStatus = { status, errMsg };
    let payload = Object.assign(errStatus, otherProps);
    return { type, payload, error: true };
}

// Import recipe
export function importRecipe(recipeUrl, tags = {}, importNotes = false) {
    return dispatch => {
        dispatch(beginImport())
        return fetch(`${SERVER_URL}/recipe-import?url=${recipeUrl}&tags=${tags}&importNotes=${importNotes}`, { method: 'POST' })
            .then(
                response => response.json(),
                error => console.error(error)
            )
            .then(json => dispatch(getImportStatus(json)))
    };
}

// Set state needed for UI to show that import has started
function beginImport() {
    return {
        type: IMPORT_RECIPE
    };
}

// Handle the results of the import
function getImportStatus(responseJson) {
    let isErrResponse = ( responseJson.code >= 400 );    
    if(isErrResponse) {
        return createErrorObject(GET_IMPORT_STATUS, responseJson.code, responseJson.message);
    }
    else {
        return { type: GET_IMPORT_STATUS, payload: responseJson };
    }
}