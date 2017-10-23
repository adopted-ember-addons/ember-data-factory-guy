import {isEmptyObject} from '../utils/helper-functions';
import MockGetRequest from './mock-get-request';

export default class MockFindAllRequest extends MockGetRequest {

  constructor(modelName) {
    super(modelName, 'findAll', []);
    this.setValidReturnsKeys(['models', 'json', 'ids','headers']);
  }

  /**
    findAll url is same as query url, so to make sure that the mockFindAll does
    not match a mockQuery ( with parameters ), declare that this is not a match
    if request params ( settings.data ) are present

    The issue arises when mockFindAll is setup before mockQuery
    @see https://github.com/danielspaniel/ember-data-factory-guy/issues/298

    @param settings ajax settings
    @returns {boolean}
   */
  paramsMatch(settings) {
    return isEmptyObject(settings.data);
  }


}