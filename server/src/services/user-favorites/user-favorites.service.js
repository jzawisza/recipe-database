// Initializes the `user-favorites` service on path `/user-favorites`
const createService = require('feathers-sequelize');
const createModel = require('../../models/user-favorites.model');
const hooks = require('./user-favorites.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/user-favorites', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('user-favorites');

  service.hooks(hooks);
};
