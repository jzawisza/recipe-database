const errors = require('@feathersjs/errors');

const invalidSavedRecipeParamError = new errors.BadRequest('The withSavedRecipes query parameter requires a value of either FAVORITES or MEAL_PLANNER.');

// If the query includes a 'withSavedRecipes' parameter, make sure its value is a valid value,
// and throw an exception if not
module.exports.checkWithSavedRecipesParam = function(query) {
    let { withSavedRecipes } = query;
    if(withSavedRecipes && !(withSavedRecipes === 'FAVORITES' || withSavedRecipes === 'MEAL_PLANNER')) {
        throw invalidSavedRecipeParamError;
      }
}