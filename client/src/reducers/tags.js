import {
    ADD_TAG,
    CLEAR_TAGS
} from '../actions/actionTypes';

const initialState = {
    tags: []
};

export function addTag(state = initialState, action) {
    switch(action.type) {
        case ADD_TAG:
            return Object.assign({}, state, {
                tags: [
                ...state.tags,
                {
                    id: action.tagId,
                    name: action.tagName
                }
                ]
            });
    default:
        return state;
    }
}

export function clearTags(state = initialState, action) {
    switch(action.type) {
        case CLEAR_TAGS:
            return (Object.assign({}, state, {
                tags: []
            }))
        default:
            return state;
    }
}