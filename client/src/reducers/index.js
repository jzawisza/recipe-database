import { combineReducers } from 'redux';
import { manageTags } from './tags';
import { editRecipe } from './editRecipe';
import { fetchRecipes, fetchFavorites, fetchMealPlannerRecipes } from './fetchRecipes';
import { searchTabOnlyFavorites } from './searchTab';

const rootReducer = combineReducers({
    manageTags,
    editRecipe,
    fetchRecipes,
    fetchFavorites,
    fetchMealPlannerRecipes,
    searchTabOnlyFavorites
});

export default rootReducer;