const cheerio = require('cheerio');
const { getJsonFromHtmlRecipeType, getTitleFromJson, getIngredientsFromJson,
    getCaloriesPerServingFromJson, getPreparationFromJson } = require('./recipe-parsing');

const SERVES_DIV_SELECTOR = 'div[class="recipe-shopper-wrapper"]';
const SERVES_SECTION_SELECTOR = '.recipe-ingredients-new';
const SERVES_DATA_ELEMENT = 'servings';
const RECIPE_SOURCE_SELECTOR = '.recipe-source';
const NOTES_SELECTOR = '.recipe-note';
const SOURCE_REGEX = /Source: (.+)/;
const CALORIES_REGEX = /(\d+) calories/;

class EatingWellImporter {
    import(url, htmlString, shouldImportNotes) {
        const $ = cheerio.load(htmlString);

        let recipeJson = getJsonFromHtmlRecipeType($);
        let title = getTitleFromJson(recipeJson);
        let source = $(RECIPE_SOURCE_SELECTOR).text().trim().match(SOURCE_REGEX)[1];
        let serves = $(SERVES_DIV_SELECTOR).children(SERVES_SECTION_SELECTOR).data(SERVES_DATA_ELEMENT);
        let caloriesPerServing = getCaloriesPerServingFromJson(recipeJson, CALORIES_REGEX);
        let ingredients = getIngredientsFromJson(recipeJson);
        let preparation = getPreparationFromJson(recipeJson);

        let notes = null;
        if(shouldImportNotes) {
            notes = $(NOTES_SELECTOR).children('p').text().trim();
        }

        return { source, title, ingredients, preparation, serves, caloriesPerServing, notes };
    }
}

module.exports = function (options) {
  return new EatingWellImporter(options);
};
        
module.exports.EatingWellImporter = EatingWellImporter;