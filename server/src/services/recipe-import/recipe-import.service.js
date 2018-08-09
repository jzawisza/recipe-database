// Initializes the `recipe-import` service on path `/recipe-import`
const createService = require('./recipe-import.class.js');
const hooks = require('./recipe-import.hooks');

module.exports = function (app) {
  
  const recipeService = app.service('recipes');
  const paginate = app.get('paginate');

  const options = {
    recipeService,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/recipe-import', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('recipe-import');

  service.hooks(hooks);
};
