import { combineReducers } from 'redux';
import { getImportStatus } from './importRecipes';
import { addTag } from './tags';

const rootReducer = combineReducers({
    getImportStatus,
    addTag
});

export default rootReducer;