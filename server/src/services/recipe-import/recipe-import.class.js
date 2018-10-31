const rp = require('request-promise');
const errors = require('@feathersjs/errors');
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
    let { url, tags, importNotes } = params.query;
    await rp(url)
      .then( function(htmlString) {
        // Query parameter values come in as strings, not booleans
        let shouldImportNotes = (importNotes === 'true');

        // TODO: handle tags

        let importer = getImporterForUrl(url);
        let recipeData = importer.import(url, htmlString, shouldImportNotes);

        // Write to database
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
