const assert = require('assert');
const app = require('../../src/app');

describe('\'recipe-links\' service', () => {
  it('registered the service', () => {
    const service = app.service('recipe-links');

    assert.ok(service, 'Registered the service');
  });
});
