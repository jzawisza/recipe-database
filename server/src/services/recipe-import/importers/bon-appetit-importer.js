const cheerio = require('cheerio');
const errors = require('@feathersjs/errors');

const BON_APPETIT_TITLE = 'Bon Appetit';
const RECIPE_DATE_SELECTOR = 'div[class="MonthYear"]';
const RECIPE_JSON_SELECTOR = 'script[type="application/ld+json"]';
const TITLE_KEY = 'name';
const SERVES_KEY = 'recipeYield';
const INGREDIENTS_KEY = 'recipeIngredient';
const PREPARATION_KEY = 'recipeInstructions';
const NOTES_KEY = 'description';
const SERVES_REGEX = /(\d+) servings/;

class BonAppetitImporter {
  import(url, htmlString, shouldImportNotes) {
    const $ = cheerio.load(htmlString);

    let magazineDate = $(RECIPE_DATE_SELECTOR).text().trim();
    if (!magazineDate) {
      throw new errors.GeneralError('Error finding recipe date');
    }
    let source = `${BON_APPETIT_TITLE}, ${magazineDate}`;

    let recipeJson = JSON.parse($(RECIPE_JSON_SELECTOR).html().trim());
    if (!recipeJson) {
      throw new errors.GeneralError('Error getting recipe JSON');
    }

    let title = recipeJson[TITLE_KEY];
    // Array element 1 contains the value of the parenthesized group in the regex
    let serves = recipeJson[SERVES_KEY].match(SERVES_REGEX)[1];
    // The ingredients are stored in an array: convert to a newline-separated string
    let ingredients = recipeJson[INGREDIENTS_KEY].join('\n');

    let preparation = '';
    let stepCount = 1;
    recipeJson[PREPARATION_KEY].forEach(element => {
      preparation += `${stepCount}. ${element.text}\n\n`;
      stepCount++;
    });

    // Handle notes if requested
    let notes = undefined;
    if (shouldImportNotes) {
      notes = recipeJson[NOTES_KEY];
    }

    // Calories per serving is theoretically supported, but is not included
    // in any recipes I can find
    return { source, title, ingredients, preparation, serves, notes };
  }
}

module.exports = function (options) {
  return new BonAppetitImporter(options);
};
      
module.exports.BonAppetitImporter = BonAppetitImporter;