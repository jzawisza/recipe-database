import fetch from 'cross-fetch';

const SERVER_URL = 'http://localhost:3030/';

// Issue a HTTP request and return a promise representing the
// JSON returned by that request
async function doHttpRequest(url, options = {}) {
    let response = await fetch(`${SERVER_URL}${url}`, options);
    return await response.json();
}

function doGet(url) {
    return doHttpRequest(url);
}

function doPost(url, postBody) {
    let postPayload = {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postBody),
        method: 'POST'
      };
    return doHttpRequest(url, postPayload);
}

export { doGet, doPost };