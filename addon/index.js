import FactoryGuy, {
  make,
  makeNew,
  makeList,
  build,
  buildList,
  attributesFor
} from './factory-guy';

import {
  mockSetup, mockTeardown,
  mockFind, mockFindRecord, mockFindAll, mockReload, mockQuery,
  mockQueryRecord, mockCreate, mockUpdate, mockDelete, mock, mockLinks
} from './mocks/exposed-request-functions';

import manualSetup from './utils/manual-setup';

import JSONAPIFixtureBuilder from './builder/jsonapi-fixture-builder';
import RESTFixtureBuilder from './builder/rest-fixture-builder';
import JSONFixtureBuilder from './builder/json-fixture-builder';

import Scenario from './scenario';

export default FactoryGuy;

export { JSONFixtureBuilder, RESTFixtureBuilder, JSONAPIFixtureBuilder };

export { make, makeNew, makeList, build, buildList, attributesFor, manualSetup, Scenario };

export {
  mockSetup, mockTeardown,
  mockFind, mockFindRecord, mockFindAll, mockReload, mockQuery,
  mockQueryRecord, mockCreate, mockUpdate, mockDelete, mock, mockLinks
};

export function setupFactoryGuy(hooks) {
  hooks.beforeEach(function() {
    manualSetup(this);
  });
}
