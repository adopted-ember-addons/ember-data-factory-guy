import FactoryGuy from 'ember-data-factory-guy';
import * as fgMethods from 'ember-data-factory-guy';

let proxyFx = [
  'make',
  'makeNew',
  'makeList',
  'build',
  'buildList',
  'mockFind',
  'mockFindRecord',
  'mockFindAll',
  'mockReload',
  'mockQuery',
  'mockQueryRecord',
  'mockUpdate',
  'mockCreate',
  'mockDelete',
  'mock',
  'attributesFor',
];

export default class {
  constructor() {
    proxyFx.forEach((fx) => (this[fx] = fgMethods[fx]));
    this.store = FactoryGuy.store;
  }

  static settings(opts = {}) {
    FactoryGuy.settings(opts);
  }

  run() {}

  include(scenarios) {
    (scenarios || []).forEach((Scenario) => new Scenario().run());
  }
}
