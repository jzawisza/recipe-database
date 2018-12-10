const rp = require('request-promise');
const errors = require('@feathersjs/errors');
const atob = require('atob');
const CookingLightImporter = require('./importers/cooking-light-importer');
const BonAppetitImporter = require('./importers/bon-appetit-importer');

function getImporterForUrl(url) {
  if(url.includes('cookinglight.com')) {
    return new CookingLightImporter();
  } else if(url.includes('bonappetit.com')) {
    return new BonAppetitImporter();
  } else {
    throw new errors.GeneralError(`No importer defined for URL ${url}`);
  }
}

class Service {
  constructor (options) {
    this.options = options || {};
    Service.recipeService = options.recipeService;
  }

  async create (data, params) {    
    // url is guaranteed to be present because of the before hook:
    // tags and importNotes are optional
    let { url, tags, importNotes } = data;
    let recipeData = undefined;

    await rp(url)
    .then( function(htmlString) {
      // Query parameter values come in as strings, not booleans
      let shouldImportNotes = (importNotes === 'true');

      let importer = getImporterForUrl(url);
      recipeData = importer.import(url, htmlString, shouldImportNotes);

      if(tags) {
        let tagArray = JSON.parse(atob(tags));
        recipeData.data = { tags: tagArray };
      }
    })
    .catch( function(err) {
      if(err.statusCode === 404) {
        throw new errors.NotFound('URL is not valid', err.url);
      }
      else {
        throw new errors.GeneralError(err);
      }
    });

    // Write to database
    let retVal = {};
    await Service.recipeService.create(recipeData)
    .then( function(returnData) {
      retVal = returnData;
    })
    .catch( function(err) {
      throw new errors.GeneralError(err);
    });

    return Promise.resolve(retVal);
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
