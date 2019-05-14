const rp = require('request-promise');
const errors = require('@feathersjs/errors');
const atob = require('atob');
const CookingLightImporter = require('./importers/cooking-light-importer');
const BonAppetitImporter = require('./importers/bon-appetit-importer');
const EatingWellImporter = require ('./importers/eating-well-importer');
const RealSimpleImporter = require ('./importers/real-simple-importer');
const SkinnyTasteImporter = require('./importers/skinny-taste-importer');
const SmittenKitchenImporter = require('./importers/smitten-kitchen-importer');

function getImporterForUrl(url) {
  if(url.includes('cookinglight.com')) {
    return new CookingLightImporter();
  } else if(url.includes('bonappetit.com')) {
    return new BonAppetitImporter();
  } else if(url.includes('eatingwell.com')) {
    return new EatingWellImporter();
  } else if(url.includes('realsimple.com')) {
    return new RealSimpleImporter();
  } else if(url.includes('smittenkitchen.com')) {
    return new SmittenKitchenImporter();
  } else if(url.includes('skinnytaste.com')) {
    return new SkinnyTasteImporter();
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
      let importer = getImporterForUrl(url);
      recipeData = importer.import(url, htmlString, importNotes);

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
