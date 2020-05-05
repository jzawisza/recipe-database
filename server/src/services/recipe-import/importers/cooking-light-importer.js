const cheerio = require('cheerio');
const URL = require('url').URL;
const errors = require('@feathersjs/errors');
const { getSourceFromHtml, getJsonFromHtmlRecipeType, getNumberOfServingsFromJson,
  getIngredientsFromJson, getPreparationFromHtml, getNotesFromJson, getCaloriesPerServingFromJson } = require('./recipe-parsing');

const COOKING_LIGHT_TITLE = 'Cooking Light';
const RECIPE_DATE_SELECTOR = 'span[class="recipe-date"]';
const SERVES_REGEX = /Serves (\d+)/;

class CookingLightImporter {
  import(url, htmlString, shouldImportNotes) {
    // Get title from URL
    let pathParts = new URL(url).pathname.split('/');
    let titlePart = pathParts[pathParts.length - 1];
    // Take a string of the form "x-y-z" and convert to "X Y Z"
    let title = titlePart.split('-').map(part => part.charAt(0).toUpperCase() + part.substr(1)).join(' ');

    // Get all other data from HTML
    const $ = cheerio.load(htmlString);

    let source = getSourceFromHtml($, RECIPE_DATE_SELECTOR, COOKING_LIGHT_TITLE);
    let recipeJson = getJsonFromHtmlRecipeType($);
    let serves = getNumberOfServingsFromJson(recipeJson, SERVES_REGEX);
    let ingredients = getIngredientsFromJson(recipeJson);
    let preparation = getPreparationFromHtml($);
    let notes = getNotesFromJson(recipeJson, shouldImportNotes);
    let caloriesPerServing = getCaloriesPerServingFromJson(recipeJson);

    return { source, title, ingredients, preparation, serves, caloriesPerServing, notes };
  }
}

module.exports = function (options) {
  return new CookingLightImporter(options);
};
    
module.exports.CookingLightImporter = CookingLightImporter;