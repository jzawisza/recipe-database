import { combineReducers } from 'redux';
import { manageTags } from './tags';
import { editRecipe } from './editRecipe';
import { fetchRecipes } from './fetchRecipes';

const rootReducer = combineReducers({
    manageTags,
    editRecipe,
    fetchRecipes
});

export default rootReducer;