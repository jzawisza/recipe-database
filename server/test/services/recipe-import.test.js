const assert = require('assert');
const app = require('../../src/app');

describe('\'recipe-import\' service', () => {
  it('registered the service', () => {
    const service = app.service('recipe-import');

    assert.ok(service, 'Registered the service');
  });
});
