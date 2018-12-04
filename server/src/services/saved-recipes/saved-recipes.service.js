// Initializes the `saved-recipes` service on path `/saved-recipes`
const createService = require('feathers-sequelize');
const createModel = require('../../models/saved-recipes.model');
const hooks = require('./saved-recipes.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/saved-recipes', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('saved-recipes');

  service.hooks(hooks);
};
