import {
    ADD_TAG,
    CLEAR_TAGS
} from './actionTypes';

// Helper function to create an error object
// TODO: if this never ends up being used, remove it,
// and remove flux-standard-actions from package.json
function createErrorObject(type, status, errMsg, otherProps = {}) {
    let errStatus = { status, errMsg };
    let payload = Object.assign(errStatus, otherProps);
    return { type, payload, error: true };
}

// Add a tag to the store
export function addTag(tag) {
    return {
        type: ADD_TAG,
        tagId: tag.id,
        tagName: tag.name
    }
}

// Clear all tags from the store
export function clearTags() {
    return {
        type: CLEAR_TAGS
    }
}