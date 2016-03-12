import Ember from 'ember';
import JSONPayload from './json-payload';

export default class extends JSONPayload {

  constructor(modelName, json, listType) {
    super(modelName, json, listType);
    this.data = json.data;
    this.addProxyMethods("includes".w());
  }

  getModelPayload() {
    return this.data;
  }

  createAttrs(data) {
    let attrs = data.attributes;
    attrs.id = data.id;
    return attrs;
  }

  includes() {
    return this.json.included || [];
  }

  getObjectKeys(key) {
    let attrs = this.createAttrs(this.data);
    if (!key) {
      return attrs;
    }
    return attrs[key];
  }

  getListKeys(key) {
    let attrs = this.data.map((data)=> this.createAttrs(data));
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