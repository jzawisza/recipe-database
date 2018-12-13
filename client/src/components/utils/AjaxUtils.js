import fetch from 'cross-fetch';

const SERVER_URL = 'http://localhost:3030/';

// Issue a HTTP request and return a promise representing the
// JSON returned by that request
async function doHttpRequest(url, options = {}) {
    let response = await fetch(`${SERVER_URL}${url}`, options);
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

// Return whether the JSON returned by the server represents an error
export function isErrorResponse(responseJson) {
    return (responseJson.code && responseJson.message);
}

// If this is an error response, return the error message
export function getErrMsg(responseJson) {
    return responseJson.message;
}

// If this is an error response, return the error code (404, 500, etc.)
export function getErrCode(responseJson) {
    return responseJson.code;
}