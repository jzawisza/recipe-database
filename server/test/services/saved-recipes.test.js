const assert = require('assert');
const app = require('../../src/app');

describe('\'saved-recipes\' service', () => {
  it('registered the service', () => {
    const service = app.service('saved-recipes');

    assert.ok(service, 'Registered the service');
  });
});
