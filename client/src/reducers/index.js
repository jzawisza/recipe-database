import { combineReducers } from 'redux';
import { manageTags } from './tags';
import { editRecipe } from './editRecipe';
import { fetchRecipes, fetchFavorites, fetchMealPlannerRecipes } from './fetchRecipes';

const rootReducer = combineReducers({
    manageTags,
    editRecipe,
    fetchRecipes,
    fetchFavorites,
    fetchMealPlannerRecipes
});

export default rootReducer;