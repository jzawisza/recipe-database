const cheerio = require('cheerio');
const { getSourceFromHtml, getJsonFromHtml, getTitleFromJson, getNumberOfServingsFromJson,
  getIngredientsFromJson, getPreparationFromHtml, getNotesFromJson } = require('./recipe-parsing');

const REAL_SIMPLE_TITLE = 'Real Simple';
const RECIPE_DATE_SELECTOR = 'span[class="recipe-date"]';
const SERVES_REGEX = /(\d+)/;

class RealSimpleImporter{
  import(url, htmlString, shouldImportNotes) {
    const $ = cheerio.load(htmlString);

    let source = getSourceFromHtml($, RECIPE_DATE_SELECTOR, REAL_SIMPLE_TITLE);

    let recipeJson = getJsonFromHtml($)[0];
    let title = getTitleFromJson(recipeJson);
    let serves = getNumberOfServingsFromJson(recipeJson, SERVES_REGEX);
    let ingredients = getIngredientsFromJson(recipeJson);
    let preparation = getPreparationFromHtml($);
    let notes = getNotesFromJson(recipeJson, shouldImportNotes);

    // Calories per serving is theoretically supported, but is not included
    // in any recipes I can find
    return { source, title, ingredients, preparation, serves, notes };
  }
}

module.exports = function (options) {
  return new RealSimpleImporter(options);
};
  
module.exports.RealSimpleImporter = RealSimpleImporter;