import { combineReducers } from 'redux';
import { manageTags } from './tags';
import { editRecipe } from './editRecipe';

const rootReducer = combineReducers({
    manageTags,
    editRecipe
});

export default rootReducer;