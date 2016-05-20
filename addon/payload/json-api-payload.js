import Ember from 'ember';
import BasePayload from './base-payload';

export default class extends BasePayload {

  constructor(modelName, json, converter) {
    super(modelName, json, converter);
    this.data = json.data;
    this.addProxyMethods(["includes"]);
  }

  getModelPayload() {
    return this.data;
  }

  add(more) {
    if (more.meta) {
      this.addMeta(more.meta);
    } else {
      if (!this.json.included) {
        this.json.included = [];
      }
      this.converter.included = this.json.included;
      // add the main moreJson model payload
      let data = more.getModelPayload();
      if (Ember.typeOf(data) === "array") {
        data.forEach(dati=> this.converter.addToIncluded(dati));
      } else {
        this.converter.addToIncluded(data);
      }
      // add all of the moreJson's includes
      this.converter.addToIncludedFromProxy(more);
    }
    return this.json;
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