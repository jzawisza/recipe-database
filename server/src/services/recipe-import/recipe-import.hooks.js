const errors = require('@feathersjs/errors');
const noUrlError = new errors.BadRequest('A POST parameter named "url" is required for this endpoint.');

function ensureUrlParam(context) {  
  let { url } = context.data;
  if (!url) {
    throw noUrlError;
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
