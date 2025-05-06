import { getContext } from '@ember/test-helpers';
import FactoryGuy, {
  make,
  makeNew,
  makeList,
  build,
  buildList,
  attributesFor,
} from './factory-guy';

import {
  mockFindRecord,
  mockFindAll,
  mockReload,
  mockQuery,
  mockQueryRecord,
  mockCreate,
  mockUpdate,
  mockDelete,
  mock,
  mockLinks,
  getPretender,
} from './mocks/exposed-request-functions';

import JSONAPIFixtureBuilder from './builder/jsonapi-fixture-builder';
import RESTFixtureBuilder from './builder/rest-fixture-builder';
import JSONFixtureBuilder from './builder/json-fixture-builder';

import Scenario from './scenario';

export default FactoryGuy;

export { JSONFixtureBuilder, RESTFixtureBuilder, JSONAPIFixtureBuilder };

export { make, makeNew, makeList, build, buildList, attributesFor, Scenario };

export {
  mockFindRecord,
  mockFindAll,
  mockReload,
  mockQuery,
  mockQueryRecord,
  mockCreate,
  mockUpdate,
  mockDelete,
  mock,
  mockLinks,
  getPretender,
};

/**
 * Setup and teardown code, intended to be called with qunit hooks so that it can run code before & after each test.
 */
export function setupFactoryGuy(hooks) {
  hooks.beforeEach(function () {
    const { owner } = getContext();
    FactoryGuy.setStore(owner.lookup('service:store'));
  });

  hooks.afterEach(function () {
    FactoryGuy.reset();
  });
}
