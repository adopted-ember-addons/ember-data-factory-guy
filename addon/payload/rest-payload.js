import Ember from 'ember';
import JSONPayload from './json-payload';

export default class extends JSONPayload {

  constructor(modelName, json, listType) {
    super(modelName, json, listType);
    json.includeKeys = ()=>this.includeKeys();
    json.getInclude = (modelType)=>this.getInclude(modelType);
    this.addReservedKeys("includeKeys getInclude".w());
  }

  getModelPayload() {
    return this.get();
  }

  includeKeys() {
    return Object.keys(this.json)
        .reject(key => this.modelName === key)
        .reject(key=> this.reserved.contains(key)) ||
        [];
  }

  getInclude(modelType) {
    return this.json[modelType];
  }

  getObjectKeys(key) {
    let attrs = this.json[this.payloadKey];
    if (Ember.isEmpty(key)) {
      return attrs;
    }
    return attrs[key];
  }

  getListKeys(key) {
    let attrs = this.json[this.payloadKey];
    if (Ember.isEmpty(key)) {
      return attrs;
    }
    if (typeof key === 'number') {
      return attrs[key];
    }
    if (key === 'firstObject') {
      return attrs[0];
    }
    if (key === 'lastObject') {
      return attrs[attrs.length - 1];
    }
  }
}