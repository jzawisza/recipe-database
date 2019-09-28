const cheerio = require('cheerio');
const errors = require('@feathersjs/errors');
const { getJsonFromHtml, getTitleFromJson, getNumberOfServingsFromJson,
  getIngredientsFromJson, getPreparationFromStepArray, getNotesFromJson, getCaloriesPerServingFromJson } = require('./recipe-parsing');

const SERVES_REGEX = /(\d+)/;
const CALORIES_REGEX = /(\d+) kcal/;
const PREPARATION_STEP_KEY = 'recipeInstructions';
const PREPARATION_STEP_TEXT_KEY = 'text';

class SkinnyTasteImporter{
  import(url, htmlString, shouldImportNotes) {
    const $ = cheerio.load(htmlString);

    let recipeJson = getJsonFromHtml($);
    let title = getTitleFromJson(recipeJson);
    let serves = getNumberOfServingsFromJson(recipeJson, SERVES_REGEX);
    let caloriesPerServing = getCaloriesPerServingFromJson(recipeJson, CALORIES_REGEX);
    let ingredients = getIngredientsFromJson(recipeJson);
    let preparation = this.getPreparationFromJson(recipeJson);
    let notes = getNotesFromJson(recipeJson, shouldImportNotes);

    return { "source" : url, title, ingredients, preparation, serves, caloriesPerServing, notes };
  }

  // TODO: move this to recipe-parsing.js if other web sites need it
  getPreparationFromJson(recipeJson) {
    let prepStepArray = recipeJson[PREPARATION_STEP_KEY];
    if (!prepStepArray) {
      throw new errors.GeneralError('Error getting preparation information from JSON');
    }

    let stepCount = 1;

    return prepStepArray.map(function(prepStep) {
      let stepText = prepStep[PREPARATION_STEP_TEXT_KEY];
      if (stepText) {
        let numberedStepText = `${stepCount}. ${stepText}`;
        stepCount++;
        return numberedStepText;
      }
    }).join('\n\n');
  }
}

module.exports = function (options) {
  return new SkinnyTasteImporter(options);
};
  
module.exports.SkinnyTasteImporter = SkinnyTasteImporter;