const cheerio = require('cheerio');
const errors = require('@feathersjs/errors');

const TITLE_SELECTOR = 'h3[class="recipeDetailHeader hideOnTabletToDesktop"]';
const SOURCE_SPAN_SELECTOR = 'span[class="submitterDisplayNameIntro"]';
const SERVES_SPAN_SELECTOR = 'span[class="servingsCount"]';
const CALORIES_SELECTOR = 'span[itemprop="calories"]';
const INGREDIENTS_SELECTOR = 'span[itemprop="ingredients"]';
const PREPARATION_SELECTOR = 'li[class="step"]';
const NOTES_DIV_SELECTOR = 'div[class="recipeSubmitter"]';
const SERVES_REGEX = /(\d+) servings/;
const CALORIES_REGEX = /(\d+) calories/;

class EatingWellImporter {
    import(url, htmlString, shouldImportNotes) {
        const $ = cheerio.load(htmlString);

        let title = $(TITLE_SELECTOR).eq(0).text().trim();
        let source = $(SOURCE_SPAN_SELECTOR).next('span').text().trim();
        let serves = $(SERVES_SPAN_SELECTOR).children('span').text().trim().match(SERVES_REGEX)[1];
        let caloriesPerServing = $(CALORIES_SELECTOR).text().trim().match(CALORIES_REGEX)[1];
        let ingredients = $(INGREDIENTS_SELECTOR).map(function(index, element) {
            return $(this).text();
        }).get().join('\n');

        let stepCount = 1;
        let preparation = $(PREPARATION_SELECTOR).map(function(index, element) {
            let elementText = $(this).text();
            if(elementText) {
                let prepStep = `${stepCount}. ${elementText}`;
                stepCount++;
                return prepStep;
            }
            return null;
        }).get().join('\n');

        let notes = null;
        if(shouldImportNotes) {
            notes = $(NOTES_DIV_SELECTOR).children('p').text().trim();
        }

        return { source, title, ingredients, preparation, serves, caloriesPerServing, notes };
    }
}

module.exports = function (options) {
  return new EatingWellImporter(options);
};
        
module.exports.EatingWellImporter = EatingWellImporter;