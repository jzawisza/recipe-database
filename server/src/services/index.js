const recipes = require('./recipes/recipes.service.js');
const tags = require('./tags/tags.service.js');
const recipeLinks = require('./recipe-links/recipe-links.service.js');
const users = require('./users/users.service.js');
const savedRecipes = require('./saved-recipes/saved-recipes.service.js');
const recipeImport = require('./recipe-import/recipe-import.service.js');
const searchRecipes = require('./search-recipes/search-recipes.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(recipes);
  app.configure(tags);
  app.configure(recipeLinks);
  app.configure(users);
  app.configure(savedRecipes);
  app.configure(recipeImport);
  app.configure(searchRecipes);
};
