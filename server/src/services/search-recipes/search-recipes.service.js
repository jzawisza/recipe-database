// Initializes the `search-recipes` service on path `/search-recipes`
const createService = require('feathers-sequelize');
const createModel = require('../../models/search-recipes.model');
const hooks = require('./search-recipes.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/search-recipes', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('search-recipes');

  service.hooks(hooks);
};
