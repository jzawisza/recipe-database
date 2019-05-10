const cheerio = require('cheerio');
const { getIngredientsFromHtml, getPreparationFromStepArray } = require('./recipe-parsing');

const TITLE_SELECTOR = 'h3[class="jetpack-recipe-title"]';
const SERVES_SELECTOR = 'li[class="jetpack-recipe-servings"]';
const INGREDIENTS_SELECTOR = 'li[class="jetpack-recipe-ingredient"]'
const PREPARATION_SELECTOR = 'div[class="jetpack-recipe-directions"]';
const NOTES_SELECTOR = 'div[class="jetpack-recipe-notes"]';

const SERVES_REGEX = /Servings: (\d+)/;

class SmittenKitchenImporter {
    import(url, htmlString, shouldImportNotes) {
        const $ = cheerio.load(htmlString);

        let title = $(TITLE_SELECTOR).text().trim();
        let serves = $(SERVES_SELECTOR).text().trim().match(SERVES_REGEX)[1];
        let ingredients = getIngredientsFromHtml($, INGREDIENTS_SELECTOR);
        let firstPrepStep = $(PREPARATION_SELECTOR).text().split('\n')[0];
        let remainingPrepSteps = getPreparationFromStepArray($(PREPARATION_SELECTOR).children('p'), $, 2);
        let preparation = `1. ${firstPrepStep}\n${remainingPrepSteps}`;

        let notes = null;
        if(shouldImportNotes) {
            let firstNote = $(NOTES_SELECTOR).text().split('\n')[0];
            let remainingNotes = $(NOTES_SELECTOR).children('p').text().trim();
            notes = `${firstNote}\n${remainingNotes}`;
        }

        return { "source": url, title, ingredients, preparation, serves, notes };
    }
}

module.exports = function (options) {
  return new SmittenKitchenImporter(options);
};
          
module.exports.SmittenKitchenImporter = SmittenKitchenImporter;