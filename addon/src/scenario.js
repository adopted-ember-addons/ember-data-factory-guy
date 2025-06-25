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
} from './mocks/exposed-request-functions';

export default class {
  constructor() {
    this.make = make;
    this.makeNew = makeNew;
    this.makeList = makeList;
    this.build = build;
    this.buildList = buildList;
    this.attributesFor = attributesFor;

    this.mockFindRecord = mockFindRecord;
    this.mockFindAll = mockFindAll;
    this.mockReload = mockReload;
    this.mockQuery = mockQuery;
    this.mockQueryRecord = mockQueryRecord;
    this.mockUpdate = mockUpdate;
    this.mockCreate = mockCreate;
    this.mockDelete = mockDelete;
    this.mock = mock;

    this.store = FactoryGuy.store;
  }

  static settings(opts = {}) {
    FactoryGuy.settings(opts);
  }

  // requestManager is only set during test runs, so we need to apply this in run().
  run() {
    this.requestManager = FactoryGuy.requestManager;
  }

  include(scenarios) {
    (scenarios || []).forEach((Scenario) => new Scenario().run());
  }
}
