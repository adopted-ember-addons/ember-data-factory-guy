import FactoryGuy from '../factory-guy';
import MockStoreRequest from './mock-store-request';
import MaybeIdUrlMatch from './maybe-id-url-match';

export default class MockDeleteRequest extends MaybeIdUrlMatch(MockStoreRequest) {

  constructor(modelName, {id, model} = {}) {
    super(modelName, 'deleteRecord');
    this.id = id;
    this.model = model;
    this.setupHandler();
  }

  getType() {
    return "DELETE";
  }

  /**
   * Create fake snaphot with adapterOptions and record.
   *
   * Override the parent to find the model in the store if there is
   * an id available
   *
   * @returns {{adapterOptions: (*|Object), record: (*|DS.Model)}}
   */
  makeFakeSnapshot() {
    let snapshot = super.makeFakeSnapshot();
    if (this.id && !this.model) {
      snapshot.record = FactoryGuy.store.peekRecord(this.modelName, this.id);
    }
    return snapshot;
  }

}
