import FactoryGuy from '../factory-guy';
import MockGetRequest from './mock-get-request';

export default class MockFindRequest extends MockGetRequest {

  constructor(modelName) {
    super(modelName);
    this.setValidReturnsKeys(['model', 'json', 'id', 'headers']);
  }

  getUrl() {
    return FactoryGuy.buildURL(this.modelName, this.get('id'));
  }

  /**
   Usually the args will be an attribute like 'id', but it might
   also be a number like 0 or 1 for and index to list types.

   Ideally the responseJson is a JSONProxy class so the logic can be handed off there.
   Otherwise it's a plain object which is rare ( so the logic is not great )

   @param args
   @returns {*}
   */
  get(args) {
    let json = this.responseJson;
    if (json.get) {
      return json.get(args);
    }
    // if this becomes issue, make this search more robust
    return json[args];
  }

}