import fetch from 'cross-fetch';

// Look up server URL from configuration settings
// This requires a default .env file at the project root
function getServerUrl() {
    let host = process.env.REACT_APP_SERVER_HOST;
    let port = process.env.REACT_APP_SERVER_PORT;
    return `${host}:${port}`;
}

// Issue a HTTP request and return a promise representing the
// JSON returned by that request
async function doHttpRequest(url, options = {}) {
    let serverUrl = getServerUrl();
    let response = await fetch(`${serverUrl}/${url}`, options);
    return await response.json();
}

function generateHeaders(requestBody, requestType) {
    return {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody),
          method: requestType
    }
}


export function doGet(url) {
    return doHttpRequest(url);
}

export function doPost(url, postBody) {
    return doHttpRequest(url, generateHeaders(postBody, 'POST'));
}

export function doPatch(url, putBody) {
    return doHttpRequest(url, generateHeaders(putBody, 'PATCH'));
}

export function doDelete(url) {
    return doHttpRequest(url, { method: 'DELETE' });
}

// Return whether the JSON returned by the server represents an error
export function isErrorResponse(responseJson) {
    if(responseJson) {
        return (responseJson.code && responseJson.message);
    }
}

// If this is an error response, return the error message
export function getErrMsg(responseJson) {
    return responseJson.message;
}

// If this is an error response, return the error code (404, 500, etc.)
export function getErrCode(responseJson) {
    return responseJson.code;
}