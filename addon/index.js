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

import manualSetup from './utils/manual-setup';

import JSONAPIFixtureBuilder from './builder/jsonapi-fixture-builder';
import RESTFixtureBuilder from './builder/rest-fixture-builder';

import Scenario from './scenario';

export default FactoryGuy;

export { RESTFixtureBuilder, JSONAPIFixtureBuilder };

export {
  make,
  makeNew,
  makeList,
  build,
  buildList,
  attributesFor,
  manualSetup,
  Scenario,
};

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

export function setupFactoryGuy(hooks) {
  hooks.beforeEach(function () {
    manualSetup(this);
  });
}
