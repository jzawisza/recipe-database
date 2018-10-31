const cheerio = require('cheerio');
const URL = require('url').URL;
const errors = require('@feathersjs/errors');

const COOKING_LIGHT_TITLE = 'Cooking Light';
const RECIPE_DATE_SELECTOR = 'span[class="recipe-date"]';
const RECIPE_JSON_SELECTOR = 'script[type="application/ld+json"]';
const PREP_STEP_SELECTOR = 'div[class="step"] p';
const TYPE_KEY = '@type';
const SERVES_KEY = 'recipeYield';
const INGREDIENTS_KEY = 'recipeIngredient';
const NUTRITION_KEY = 'nutrition';
const CALORIES_KEY = 'calories';
const NOTES_KEY = 'description';
const TYPE_VALUE_RECIPE = 'Recipe';
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

    let magazineDate = $(RECIPE_DATE_SELECTOR).text().trim();
    if (!magazineDate) {
      throw new errors.GeneralError('Error finding recipe date');
    }
    let source = `${COOKING_LIGHT_TITLE}, ${magazineDate}`;

    // Get ingredients, serves, and calories from recipe JSON
    let recipeJSONArray = JSON.parse($(RECIPE_JSON_SELECTOR).html().trim());
    if (!recipeJSONArray) {
      throw new errors.GeneralError('Error getting recipe JSON');
    }
    let recipeObj = recipeJSONArray.filter(item => item[TYPE_KEY] === TYPE_VALUE_RECIPE)[0];
    // Array element 1 contains the value of the parenthesized group in the regex
    let serves = recipeObj[SERVES_KEY].match(SERVES_REGEX)[1];
    // The ingredients are stored in an array: convert to a newline-separated string
    let ingredients = recipeObj[INGREDIENTS_KEY].join('\n');        
    let nutritionObj = recipeObj[NUTRITION_KEY];
    if (!nutritionObj) {
      throw new errors.GeneralError('Error getting nutrition information from JSON');
    }
    let caloriesPerServing = nutritionObj[CALORIES_KEY];

    // Handle notes if requested
    let notes = null;
    if (shouldImportNotes) {
      notes = recipeObj[NOTES_KEY];
    }

    // Get preparation from HTML so we can break it into paragraphs:
    // the JSON has the data in a single paragraph
    let preparation = '';
    let stepCount = 1;
    $(PREP_STEP_SELECTOR).each( function() {
      preparation += `${stepCount}. ${$(this).text()}\n\n`;
      stepCount++;
    });
    // Remove the trailing newlines
    let prepLen = preparation.length;
    preparation = preparation.substring(0, prepLen - 2);

    return { source, title, ingredients, preparation, serves, caloriesPerServing, notes };
  }
}

module.exports = function (options) {
  return new CookingLightImporter(options);
};
    
module.exports.CookingLightImporter = CookingLightImporter;