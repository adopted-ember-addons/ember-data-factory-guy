import Ember from 'ember';
import FactoryGuy, * as fgMethods from 'ember-data-factory-guy';

let proxyFx = [
  'make', 'makeList', 'build', 'buildList', 'mockFind', 'mockFindAll', 'mockReload',
  'mockQuery', 'mockQueryRecord', 'mockUpdate', 'mockCreate', 'mockDelete'
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