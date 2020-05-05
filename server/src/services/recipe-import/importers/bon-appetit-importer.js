const cheerio = require('cheerio');
const { getSourceFromHtml, getJsonFromHtml, getTitleFromJson, getNumberOfServingsFromJson,
  getIngredientsFromJson, getPreparationFromJson, getNotesFromJson } = require('./recipe-parsing');

const BON_APPETIT_TITLE = 'Bon Appetit';
const RECIPE_DATE_SELECTOR = 'div[class="MonthYear"]';
const SERVES_REGEX = /(\d+)/;

class BonAppetitImporter {
  import(url, htmlString, shouldImportNotes) {
    const $ = cheerio.load(htmlString);

    let source = getSourceFromHtml($, RECIPE_DATE_SELECTOR, BON_APPETIT_TITLE);
    let recipeJson = getJsonFromHtml($);
    let title = getTitleFromJson(recipeJson);
    let serves = getNumberOfServingsFromJson(recipeJson, SERVES_REGEX);
    let ingredients = getIngredientsFromJson(recipeJson);
    let notes = getNotesFromJson(recipeJson, shouldImportNotes);
    let preparation = getPreparationFromJson(recipeJson);

    // Calories per serving is theoretically supported, but is not included
    // in any recipes I can find
    return { source, title, ingredients, preparation, serves, notes };
  }
}

module.exports = function (options) {
  return new BonAppetitImporter(options);
};
      
module.exports.BonAppetitImporter = BonAppetitImporter;