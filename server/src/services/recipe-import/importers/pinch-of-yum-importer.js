const cheerio = require('cheerio');
const { getJsonFromHtml, getTitleFromJson, getNumberOfServingsFromJson,
  getIngredientsFromJson, getCaloriesPerServingFromJson } = require('./recipe-parsing');

const SERVES_REGEX = /(\d+)/;
const PREPARATION_KEY = 'recipeInstructions';
const PREP_STEP_KEY = 'text';
const NOTES_SELECTOR = 'div[class="tasty-recipes-notes"] p'

class PinchOfYumImporter{
  import(url, htmlString, shouldImportNotes) {
    const $ = cheerio.load(htmlString);

    let recipeJson = getJsonFromHtml($, 1);
    let title = getTitleFromJson(recipeJson);
    let serves = getNumberOfServingsFromJson(recipeJson, SERVES_REGEX);
    let caloriesPerServing = getCaloriesPerServingFromJson(recipeJson);
    let ingredients = getIngredientsFromJson(recipeJson);

    let stepCount = 1;
    let preparation = recipeJson[PREPARATION_KEY].map(function(prepStep) {
        let stepStr = `${stepCount}. ${prepStep[PREP_STEP_KEY]}`;
        stepCount++;
        return stepStr;
    }).join('\n\n');

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