const errors = require('@feathersjs/errors');
const noUrlParamError = new errors.BadRequest('A parameter named "url" is required for this endpoint.');

function ensureUrlParam(context) {  
  let { url } = context.params.query;
  if (!url) {
    throw noUrlParamError;
  }
}

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [ensureUrlParam],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
