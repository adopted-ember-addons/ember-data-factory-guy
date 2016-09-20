import Ember from 'ember';
import BasePayload from './base-payload';

export default class extends BasePayload {

  constructor(modelName, json, converter) {
    super(modelName, json, converter);
    this.payloadKey = converter.getPayloadKey(modelName);
    this.addProxyMethods(['includeKeys','getInclude']);
  }

  includeKeys() {
    let keys = Ember.A(Object.keys(this.json)).reject(key => this.payloadKey === key);
    return Ember.A(keys).reject(key=> Ember.A(this.proxyMethods).includes(key)) || [];
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
