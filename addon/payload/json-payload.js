import Ember from 'ember';
import BasePayload from './base-payload';

export default class extends BasePayload {

  constructor(modelName, json, converter) {
    super(modelName, json, converter);
  }

  getObjectKeys(key) {
    let attrs = this.json;
    if (Ember.isEmpty(key)) {
      return JSON.parse(JSON.stringify(attrs));
    }
    return attrs[key];
  }

  getListKeys(key) {
    let attrs = this.json;
    if (Ember.isEmpty(key)) {
      return JSON.parse(JSON.stringify(attrs));
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