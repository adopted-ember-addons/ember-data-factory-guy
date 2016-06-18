import Ember from 'ember';
import FactoryGuy, {make, makeList, build, buildList, mockFind, mockFindAll,
  mockQuery, mockQueryRecord, mockUpdate, mockDelete} from 'ember-data-factory-guy';

export default class {

  constructor(opts) {
    this.make = make;
    this.makeList = makeList;
    this.build = build;
    this.buildList = buildList;
    this.mockFind = mockFind;
    this.mockFindAll = mockFindAll;
    this.mockQuery = mockQuery;
    this.mockQueryRecord = mockQueryRecord;
    this.mockUpdate = mockUpdate;
    this.mockDelete = mockDelete;
    this.store = FactoryGuy.store;
    this.setupOptions(opts);
    this.run();
  }

  setupOptions(opts={})  {
    Ember.$.mockjaxSettings.logging = !!opts.debug;
    Ember.$.mockjaxSettings.responseTime = opts.responseTime || 0;
  }

  run() {
  }

  include(scenarios) {
    (scenarios || []).forEach((Scenario)=> new Scenario());
  }
}