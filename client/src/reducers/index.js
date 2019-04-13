import { combineReducers } from 'redux';
import { manageTags } from './tags';
import { editRecipe } from './editRecipe';
import { fetchRecipes, fetchFavorites, fetchMealPlannerRecipes } from './fetchRecipes';
import { searchTab } from './searchTab';

const rootReducer = combineReducers({
    manageTags,
    editRecipe,
    fetchRecipes,
    fetchFavorites,
    fetchMealPlannerRecipes,
    searchTab
});

export default rootReducer;