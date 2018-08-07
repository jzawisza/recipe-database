const recipes = require('./recipes/recipes.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(recipes);
};
