import Ember from 'ember';
import MockRequest from './mock-request';

export default class MockLinksRequest extends MockRequest {

  constructor(model, relationshipKey) {
    super();
    this.model = model;
    this.relationshipKey = relationshipKey;
    this.type = 'GET';
    this.status = 200;
    this.setupHandler();
  }

  getUrl() {
    let modelClass    = this.model.constructor,
        relationships = Ember.get(modelClass, 'relationshipsByName'),
        modelName     = modelClass.modelName,
        relationship  = relationships.get(this.relationshipKey);

    Ember.assert(
      `[ember-data-factory-guy] mockLinks can not find that relationship 
      [${this.relationshipKey}] on model of type ${modelName}`, relationship
    );

    return this.model[relationship.kind](this.relationshipKey).link();
  }

  getType() {
    return this.type;
  }

  /**
   * Return some form of object
   *
   * @param json
   * @returns {*}
   */
  returns(json) {
    this.responseJson = json;
    return this;
  }

}
