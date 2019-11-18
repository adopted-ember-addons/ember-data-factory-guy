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
}
