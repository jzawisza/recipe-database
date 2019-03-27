const DEFAULT_USER_ID = 0;
const { checkWithSavedRecipesParam } = require('../helpers/check-params');

function joinWithSavedRecipes(context) {
  let { withSavedRecipes } = context.params.query;
  // Write the check this way to distinguish between query parameters that don't include withSavedRecipes at all (valid)
  // and query parameters that include withSavedRecipes, but without a value (not valid)
  if(withSavedRecipes !== undefined) {
    checkWithSavedRecipesParam(context.params.query);

    // If we have a valid value for this query parameter, join the recipes table with saved_recipes
    // and filter the query based on the query parameter
    const sequelize = context.app.get('sequelizeClient');
    const { saved_recipes } = sequelize.models;

    // TODO: support multiple user IDs
    context.params.sequelize = {
      include: [{
        model: saved_recipes,
        as: 'savedRecipe',
        where: { type: withSavedRecipes, userId: DEFAULT_USER_ID, value: true },
        required: true
      }]
    };

    // Don't pass this parameter on to Feathers
    delete context.params.query.withSavedRecipes;
  }

  return context;
}

module.exports = {
  before: {
    all: [],
    find: [joinWithSavedRecipes],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
