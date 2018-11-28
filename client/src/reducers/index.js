import { combineReducers } from 'redux';
import { getImportStatus } from './importRecipes';
import { manageTags } from './tags';

const rootReducer = combineReducers({
    getImportStatus,
    manageTags
});

export default rootReducer;