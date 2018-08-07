// Initializes the `recipe-links` service on path `/recipe-links`
const createService = require('feathers-sequelize');
const createModel = require('../../models/recipe-links.model');
const hooks = require('./recipe-links.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/recipe-links', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('recipe-links');

  service.hooks(hooks);
};
