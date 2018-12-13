import {
    ADD_TAG,
    CLEAR_TAGS
} from '../actions/actionTypes';

const initialState = {
    tags: []
};

export function manageTags(state = initialState, action) {
    switch(action.type) {
        case ADD_TAG:
            return Object.assign({}, state, {
                tags: [
                ...state.tags,
                {
                    id: action.payload.tagId,
                    name: action.payload.tagName
                }
                ]
            });
        case CLEAR_TAGS:
            return (Object.assign({}, state, {
                tags: []
            }))
        default:
            return state;
    }
}