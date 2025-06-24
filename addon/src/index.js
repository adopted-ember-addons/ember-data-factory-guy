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
} from './mocks/exposed-request-functions';

import JSONAPIFixtureBuilder from './builder/jsonapi-fixture-builder';
import RESTFixtureBuilder from './builder/rest-fixture-builder';
import JSONFixtureBuilder from './builder/json-fixture-builder';
import ActiveModelFixtureBuilder from './builder/active-model-fixture-builder';

import Scenario from './scenario';
import MissingSequenceError from './missing-sequence-error';

import RequestManagerPretender from './mocks/request-manager-pretender';

export default FactoryGuy;

export { make, makeNew, makeList, build, buildList, attributesFor };

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
};

export {
  JSONFixtureBuilder,
  RESTFixtureBuilder,
  JSONAPIFixtureBuilder,
  ActiveModelFixtureBuilder,
};

export { Scenario, MissingSequenceError };

/**
 * Setup and teardown code, intended to be called with qunit hooks so that it can run code before & after each test.
 */
export function setupFactoryGuy(hooks, requestManager) {
  hooks.beforeEach(async function () {
    const { owner } = getContext();
    FactoryGuy.setStore(owner.lookup('service:store'));

    const rm = requestManager ? requestManager : new RequestManagerPretender();
    FactoryGuy.setRequestManager(rm);

    this.requestManager = rm;
    await this.requestManager.start();
  });

  hooks.afterEach(function () {
    FactoryGuy.reset();
  });
}
