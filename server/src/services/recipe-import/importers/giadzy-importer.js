const cheerio = require('cheerio');
const { getPreparationFromStepArray } = require('./recipe-parsing');

const TITLE_SELECTOR = 'h1[class="p-name"]';
const SERVES_SELECTOR = 'data[class="p-yield"]';
const INGREDIENTS_SELECTOR = 'div[class="recipe-ingredients"] p';
const PREPARATION_SELECTOR = 'div[class="e-instructions"] p';
const NOTES_SELECTOR = 'meta[name="description"]';
const NOTES_ATTRIBUTE = 'content';
const SERVES_REGEX = /Serves (\d+)/;

class GiadzyImporter {
    import(url, htmlString, shouldImportNotes) {
      const $ = cheerio.load(htmlString);

      let title = $(TITLE_SELECTOR).text().trim();
      let serves = $(SERVES_SELECTOR).text().trim().match(SERVES_REGEX)[1];
      let ingredients =  $(INGREDIENTS_SELECTOR).map(function() {
          // The 'Serves' information is included as part of the ingredients,
          // so filter it out
          let ingredient = $(this).text();
          if (!ingredient.match(SERVES_REGEX)) {
              return ingredient;
          }
      }).get().join('\n');
      let preparation = getPreparationFromStepArray($(PREPARATION_SELECTOR), $);

      let notes = null;
      if(shouldImportNotes) {
        notes = $(NOTES_SELECTOR).attr(NOTES_ATTRIBUTE).trim();
      }

      return { "source" : url, title, ingredients, preparation, serves, notes };
    }
}

module.exports = function (options) {
  return new GiadzyImporter(options);
};

module.exports.GiadzyImporter = GiadzyImporter;
  