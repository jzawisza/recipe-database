import {
    ADD_TAG,
    CLEAR_TAGS,
    FETCH_TAGS,
    DELETE_TAG
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
        case FETCH_TAGS: {
            return Object.assign({}, state, {
                tags: action.payload.tags
            })
        }
        case DELETE_TAG: {
            return Object.assign({}, state, {
                tags: action.payload.tags
            })
        }
        default:
            return state;
    }
}