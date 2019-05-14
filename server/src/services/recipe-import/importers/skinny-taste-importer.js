const cheerio = require('cheerio');
const { getJsonFromHtml, getTitleFromJson, getNumberOfServingsFromJson,
  getIngredientsFromJson, getPreparationFromStepArray, getNotesFromJson } = require('./recipe-parsing');

const SERVES_REGEX = /(\d+)/;
const NUTRITION_KEY = 'nutrition';
const CALORIES_KEY = 'calories';
const PREPARATION_SELECTOR = 'div[class="instructions"] li'

class SkinnyTasteImporter{
  import(url, htmlString, shouldImportNotes) {
    const $ = cheerio.load(htmlString);

    let recipeJson = getJsonFromHtml($);
    let title = getTitleFromJson(recipeJson);
    let serves = getNumberOfServingsFromJson(recipeJson, SERVES_REGEX);
    let caloriesPerServing = recipeJson[NUTRITION_KEY][CALORIES_KEY];
    let ingredients = getIngredientsFromJson(recipeJson);
    let preparation = getPreparationFromStepArray($(PREPARATION_SELECTOR), $);
    let notes = getNotesFromJson(recipeJson, shouldImportNotes);

    return { "source" : url, title, ingredients, preparation, serves, caloriesPerServing, notes };
  }
}

module.exports = function (options) {
  return new SkinnyTasteImporter(options);
};
  
module.exports.SkinnyTasteImporter = SkinnyTasteImporter;