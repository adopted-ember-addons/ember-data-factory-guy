/* Disabling the following lint rules as `MockStoreRequest` and `MockGetRequest` contains a `this.get` method */
/* eslint-disable ember/no-get, ember/classic-decorator-no-classic-methods */
import FactoryGuy from '../factory-guy';
import MockRequest from './mock-request';

export default class extends MockRequest {
  constructor(modelName, requestType) {
    super();
    this.modelName = modelName;
    this.requestType = requestType;
    this.fixtureBuilder = FactoryGuy.fixtureBuilder(this.modelName);
  }

  /**
   Used by getUrl to => this.get('id')

   MockGetRequest overrides this since those mocks have a payload with the id

   For mockDelete: If the id is null the url will not include the id, and
   can therefore be used to match any delete for this modelName
   */
  get(...args) {
    if (args[0] === 'id') {
      return this.id;
    }
  }

  /**
   * Using adapterOptions for snapshot in GET requests
   *
   * @returns {String}
   */
  getUrl() {
    return FactoryGuy.buildURL(
      this.modelName,
      this.get('id'),
      this.makeFakeSnapshot(),
      this.requestType,
      this.queryParams
    );
  }

  /**
   * Create fake snaphot with adapterOptions and record
   *
   * @returns {{adapterOptions: (*|Object), record: (*|DS.Model)}}
   */
  makeFakeSnapshot() {
    let record = this.model;

    if (!record && this.get('id')) {
      record = FactoryGuy.store.peekRecord(this.modelName, this.get('id'));
    }

    return { adapterOptions: this.adapterOptions, record };
  }
}
