import { combineReducers } from 'redux';
import { getImportStatus } from './importRecipes';

const rootReducer = combineReducers({
    getImportStatus
});

export default rootReducer;