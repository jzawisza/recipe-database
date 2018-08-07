const assert = require('assert');
const app = require('../../src/app');

describe('\'user-favorites\' service', () => {
  it('registered the service', () => {
    const service = app.service('user-favorites');

    assert.ok(service, 'Registered the service');
  });
});
