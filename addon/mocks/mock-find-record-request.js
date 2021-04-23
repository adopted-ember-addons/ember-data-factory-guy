/* Disabling the following lint rules as `MockStoreRequest` and `MockGetRequest` contain a `this.get` method */
/* eslint-disable ember/no-get, ember/classic-decorator-no-classic-methods */
import FactoryGuy from 'ember-data-factory-guy';
import MockGetRequest from './mock-get-request';

export default class MockFindRecordRequest extends MockGetRequest {
  constructor(modelName) {
    super(modelName, 'findRecord');
    this.setValidReturnsKeys(['model', 'json', 'id', 'headers']);
  }

  /**
   * When using returns({id: id}), this is flagged as an idSearch, so
   * that at the last moment when this handler is returning the request response,
   * we can check the store and see if a model with that id exists.
   *
   * If not, then this will be a 404 not found error
   *
   * @param settings
   * @returns {*}
   */
  extraRequestMatches(settings) {
    if (this.idSearch) {
      let model = FactoryGuy.store.peekRecord(this.modelName, this.get('id'));
      if (!model) {
        // the match still succeeds but the response is failure
        this.fails({ status: 404 });
      }
    }
    return super.extraRequestMatches(settings);
  }
}
