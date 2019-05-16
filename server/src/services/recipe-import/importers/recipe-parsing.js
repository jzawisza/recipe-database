// Helper methods for parsing recipe data from common HTML and JSON formats

const errors = require('@feathersjs/errors');

const RECIPE_JSON_SELECTOR = 'script[type="application/ld+json"]';
const PREP_STEP_SELECTOR = 'div[class="step"] p';

const INGREDIENTS_KEY = 'recipeIngredient';
const NOTES_KEY = 'description';
const SERVES_KEY = 'recipeYield';
const TITLE_KEY = 'name';
const NUTRITION_KEY = 'nutrition';
const CALORIES_KEY = 'calories';

//
// JSON parsing methods
//
module.exports.getTitleFromJson = function(recipeJson) {
  return recipeJson[TITLE_KEY];
};

module.exports.getNumberOfServingsFromJson = function(recipeJson, servesRegex) {
  // Array element 1 contains the value of the parenthesized group in the regex
  let regexMatch = recipeJson[SERVES_KEY].match(servesRegex);
  return regexMatch ? regexMatch[1] : undefined;
};

module.exports.getIngredientsFromJson = function(recipeJson) {
  // The ingredients are stored in an array: convert to a newline-separated string
  return recipeJson[INGREDIENTS_KEY].join('\n'); 
};

// Only return notes if requested: otherwise, return undefined
module.exports.getNotesFromJson = function(recipeJson, shouldImportNotes) {
  return shouldImportNotes ? recipeJson[NOTES_KEY] : undefined;
};

module.exports.getCaloriesPerServingFromJson = function(recipeJson) {
  let nutritionObj = recipeJson[NUTRITION_KEY];
    if (!nutritionObj) {
      throw new errors.GeneralError('Error getting nutrition information from JSON');
    }
    return caloriesPerServing = nutritionObj[CALORIES_KEY];
}


//
// HTML parsing methods
//

// Extract the recipe JSON object from the HTML
module.exports.getJsonFromHtml = function(htmlObj, jsonPos = 0) {
  let recipeJson = null;
  let recipeSelector = jsonPos ? htmlObj(RECIPE_JSON_SELECTOR).eq(jsonPos) : htmlObj(RECIPE_JSON_SELECTOR);
  recipeJson = JSON.parse(recipeSelector.html().trim());
  if (!recipeJson) {
    throw new errors.GeneralError('Error getting recipe JSON');
  }

  return recipeJson;
};

module.exports.getSourceFromHtml = function(htmlObj, magazineDateSelector, magazineTitle) {
  let magazineDate = htmlObj(magazineDateSelector).text().trim();
  if (!magazineDate) {
    throw new errors.GeneralError('Error finding recipe date');
  }
  return `${magazineTitle}, ${magazineDate}`;
};

// Several web sites have the preparation in the JSON, but as a single paragraph:
// fetching it from the HTML allows us to break it into separate paragraphs
module.exports.getPreparationFromHtml = function(htmlObj) {
  let preparation = '';
  let stepCount = 1;
  htmlObj(PREP_STEP_SELECTOR).each( function() {
    preparation += `${stepCount}. ${htmlObj(this).text()}\n\n`;
    stepCount++;
  });
  // Remove the trailing newlines
  let prepLen = preparation.length;
  preparation = preparation.substring(0, prepLen - 2);

  return preparation;
};

module.exports.getPreparationFromStepArray = function(stepArray, htmlObj, stepCount = 1) {
  return stepArray.map(function(index, element) {
    let elementText = htmlObj(this).text();
    if(elementText) {
        let prepStep = `${stepCount}. ${elementText}`;
        stepCount++;
        return prepStep;
    }
    return null;
}).get().join('\n\n');
};

module.exports.getIngredientsFromHtml = function(htmlObj, ingredientsSelector) {
  return htmlObj(ingredientsSelector).map(function(index, element) {
    return htmlObj(this).text();
}).get().join('\n');
}