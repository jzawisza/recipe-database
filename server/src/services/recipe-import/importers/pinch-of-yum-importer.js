const cheerio = require('cheerio');
const { getJsonFromHtmlRecipeType, getTitleFromJson, getNumberOfServingsFromJson,
  getIngredientsFromJson, getCaloriesPerServingFromJson, getPreparationFromJson } = require('./recipe-parsing');

const SERVES_REGEX = /(\d+)/;
const NOTES_SELECTOR = 'div[class="tasty-recipes-notes"] p'
const RECIPE_JSON_KEY = '@graph';

class PinchOfYumImporter{
  import(url, htmlString, shouldImportNotes) {
    const $ = cheerio.load(htmlString);

    let recipeJson = getJsonFromHtmlRecipeType($, 0, RECIPE_JSON_KEY);
    let title = getTitleFromJson(recipeJson);
    let serves = getNumberOfServingsFromJson(recipeJson, SERVES_REGEX);
    let caloriesPerServing = getCaloriesPerServingFromJson(recipeJson);
    let ingredients = getIngredientsFromJson(recipeJson);
    let preparation = getPreparationFromJson(recipeJson);

    let notes = null;
    if (shouldImportNotes) {
        notes = $(NOTES_SELECTOR).map(function(index, element) {
            return $(this).text();
        }).get().join('\n\n');
    }

    return { "source" : url, title, ingredients, preparation, serves, caloriesPerServing, notes };
  }
}

module.exports = function (options) {
  return new PinchOfYumImporter(options);
};
  
module.exports.PinchOfYumImporter = PinchOfYumImporter;