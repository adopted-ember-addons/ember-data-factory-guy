import Ember from 'ember';
import JSONPayload from './json-payload';

export default class extends JSONPayload {

  constructor(modelName, json, converter) {
    super(modelName, json, converter);
    this.addProxyMethods(['includeKeys','getInclude']);
  }

  add(moreJson) {
    this.converter.included = this.json;
    Ember.A(Object.keys(moreJson))
      .reject(key=> Ember.A(this.proxyMethods).contains(key))
      .forEach(key=> {
        if (Ember.typeOf(moreJson[key]) === "array") {
          moreJson[key].forEach(data=> this.converter.addToIncluded(data, key));
        } else {
          this.converter.addToIncluded(moreJson[key], key);
        }
      });
    return this.json;
  }

  includeKeys() {
    let keys = Ember.A(Object.keys(this.json)).reject(key => this.payloadKey === key);
    return Ember.A(keys).reject(key=> Ember.A(this.proxyMethods).contains(key)) || [];
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
