import Ember from 'ember';
import FactoryGuy from 'ember-data-factory-guy';
import * as fgMethods from 'ember-data-factory-guy';

let proxyFx = [
  'make', 'makeNew', 'makeList', 'build', 'buildList',
  'mockFind', 'mockFindRecord', 'mockFindAll',
  'mockReload', 'mockQuery', 'mockQueryRecord',
  'mockUpdate', 'mockCreate', 'mockDelete'
];

export default class {

  constructor() {
    proxyFx.forEach(fx => this[fx] = fgMethods[fx]);
    this.store = FactoryGuy.store;
  }

  static settings(opts = {}) {
    Ember.$.mockjaxSettings.logging = opts.mockjaxLogLevel || 1;
    Ember.$.mockjaxSettings.responseTime = opts.responseTime || 0;
    FactoryGuy.settings(opts);
  }

  run() {
  }

  include(scenarios) {
    (scenarios || []).forEach(Scenario => (new Scenario()).run());
  }
}