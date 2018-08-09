const recipes = require('./recipes/recipes.service.js');
const tags = require('./tags/tags.service.js');
const recipeLinks = require('./recipe-links/recipe-links.service.js');
const users = require('./users/users.service.js');
const userFavorites = require('./user-favorites/user-favorites.service.js');
const recipeImport = require('./recipe-import/recipe-import.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(recipes);
  app.configure(tags);
  app.configure(recipeLinks);
  app.configure(users);
  app.configure(userFavorites);
  app.configure(recipeImport);
};
