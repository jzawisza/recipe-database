// Helper methods for parsing recipe data from common HTML and JSON formats

const errors = require('@feathersjs/errors');

const RECIPE_JSON_SELECTOR = 'script[type="application/ld+json"]';
const PREP_STEP_SELECTOR = 'div[class="step"] p';

const TYPE_KEY = '@type';
const TYPE_VALUE_RECIPE = 'Recipe';
const INGREDIENTS_KEY = 'recipeIngredient';
const NOTES_KEY = 'description';
const SERVES_KEY = 'recipeYield';
const TITLE_KEY = 'name';
const NUTRITION_KEY = 'nutrition';
const CALORIES_KEY = 'calories';
const PREPARATION_KEY = 'recipeInstructions';
const PREP_STEP_KEY = 'text';

//
// Helper methods
//

// Given a string and a regular expression with a grouping,
// return the value of the parenthesized group, or undefined if the regex doesn't match
function parseRegex(strToParse, regex) {
  let regexMatch = strToParse.match(regex);
  // Array element 1 contains the value of the parenthesized group in the regex
  return regexMatch ? regexMatch[1] : undefined;
}

// Helper so both the exported getJsonFromHtml and getJsonFromHtmlRecipeType methods
// can use this functionality
function getJsonFromHtmlInternal (htmlObj, jsonPos) {
  let recipeJson = null;
  let recipeSelector = jsonPos ? htmlObj(RECIPE_JSON_SELECTOR).eq(jsonPos) : htmlObj(RECIPE_JSON_SELECTOR);
  console.log(`Recipe selector = ${recipeSelector}`);
  recipeJson = JSON.parse(recipeSelector.html().trim());
  if (!recipeJson) {
    throw new errors.GeneralError('Error getting recipe JSON');
  }

  return recipeJson;
};

//
// JSON parsing methods
//
module.exports.getTitleFromJson = function(recipeJson) {
  return recipeJson[TITLE_KEY];
};

module.exports.getNumberOfServingsFromJson = function(recipeJson, servesRegex) {
  return parseRegex(recipeJson[SERVES_KEY], servesRegex);
};

module.exports.getIngredientsFromJson = function(recipeJson) {
  // The ingredients are stored in an array: convert to a newline-separated string
  return recipeJson[INGREDIENTS_KEY].join('\n'); 
};

// Only return notes if requested: otherwise, return undefined
module.exports.getNotesFromJson = function(recipeJson, shouldImportNotes) {
  return shouldImportNotes ? recipeJson[NOTES_KEY] : undefined;
};

module.exports.getCaloriesPerServingFromJson = function(recipeJson, caloriesRegex) {
  let nutritionObj = recipeJson[NUTRITION_KEY];
  if (!nutritionObj) {
    throw new errors.GeneralError('Error getting nutrition information from JSON');
  }
  let caloriesPerServing = nutritionObj[CALORIES_KEY];
  return caloriesRegex ? parseRegex(caloriesPerServing, caloriesRegex) : caloriesPerServing;
}

module.exports.getPreparationFromJson = function(recipeJson) {
  let stepCount = 1;
  return recipeJson[PREPARATION_KEY].map(function(prepStep) {
      let stepStr = `${stepCount}. ${prepStep[PREP_STEP_KEY]}`;
      stepCount++;
      return stepStr;
  }).join('\n\n');
}


//
// HTML parsing methods
//

// Extract the recipe JSON object from the HTML
module.exports.getJsonFromHtml = function(htmlObj, jsonPos = 0) {
  return getJsonFromHtmlInternal(htmlObj, jsonPos);
};

// Some web sites have a complex JSON object or JSON array in the recipe JSON:
// this method handles those cases appropriately
module.exports.getJsonFromHtmlRecipeType = function(htmlObj, jsonPos = 0, recipeJsonKey) {
  let origRecipeJson = getJsonFromHtmlInternal(htmlObj, jsonPos);

  // If we need to look into the JSON object to get the recipe JSON, do so here
  let recipeJson = recipeJsonKey ? origRecipeJson[recipeJsonKey] : origRecipeJson;

  return recipeJson.filter(item => item[TYPE_KEY] === TYPE_VALUE_RECIPE)[0];
}

module.exports.getSourceFromHtml = function(htmlObj, magazineDateSelector, magazineTitle) {
  let magazineDate = htmlObj(magazineDateSelector).text().trim();
  if (!magazineDate) {
    throw new errors.GeneralError('Error finding recipe date');
  }
  return `${magazineTitle}, ${magazineDate}`;
};

// Several web sites have the preparation in the JSON, but as a single paragraph:
// fetching it from the HTML allows us to break it into separate paragraphs.
//
// This method supports a common format for representing the recipe preparation in HTML:
// for other formats, the getPreparationFromStepArray method should be used directly.
module.exports.getPreparationFromHtml = function(htmlObj) {
  return module.exports.getPreparationFromStepArray(htmlObj(PREP_STEP_SELECTOR), htmlObj, 1);
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