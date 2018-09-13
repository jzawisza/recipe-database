const rp = require('request-promise');
const errors = require('@feathersjs/errors');
const cheerio = require('cheerio');
const URL = require('url').URL;

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

class Service {
  constructor (options) {
    this.options = options || {};
    Service.recipeService = options.recipeService;
  }  

  async create (data, params) {
    // url is guaranteed to be present because of the before hook:
    // tags and importNotes are optional
    let { url, tags, importNotes } = params.query;
    await rp(url)
      .then( function(htmlString) {
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
        // Query parameter values come in as strings, not booleans
        if (importNotes === 'true') {
          notes = recipeObj[NOTES_KEY];
        }

        // Get preparation from HTML so we can break it into paragraphs:
        // the JSON has the data in a single paragraph
        let preparation = '';
        $(PREP_STEP_SELECTOR).each( function() {
          preparation += $(this).text();
          preparation += '\n\n';
        });
        // Remove the trailing newlines
        let prepLen = preparation.length;
        preparation = preparation.substring(0, prepLen - 2);

        // TODO: handle tags

        // Write to database
        let recipeData = { source, title, ingredients, preparation, serves, caloriesPerServing, notes };
        Service.recipeService.create(recipeData)
          .catch( function(err) {
            // TODO: figure out why this exception isn't propagating
            throw new errors.GeneralError(err);
          });
      })
      .catch( function(err) {        
        if(err.statusCode === 404) {
          throw new errors.NotFound('URL is not valid', err.url);
        }
        else {
          throw new errors.GeneralError(err);
        }
      });

    return Promise.resolve(data);
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
