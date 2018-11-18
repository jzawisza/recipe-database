import {
    GET_IMPORT_STATUS
} from '../actions/actionTypes';
import { isError } from 'flux-standard-action';

const IMPORT_STATUS_OK = "Import succeeded";
const IMPORT_STATUS_ERROR = "Import failed";

const initialState = {
    importSucceeded: true,
    importStatusMsg: ''
}

export function getImportStatus(state = initialState, action) {
    switch(action.type) {
        case GET_IMPORT_STATUS:
            if (isError(action)) {
                return {
                    ...state,
                    importSucceeded: false,
                    importStatusMsg: `${IMPORT_STATUS_ERROR}: ${action.payload.errMsg}`
                };
            }
            else {
                return Object.assign({}, state, {
                    importSucceeded: true,
                    importStatusMsg: IMPORT_STATUS_OK
                });
            }
        default:
            return state;
    }
}