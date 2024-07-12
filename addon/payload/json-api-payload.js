import { isEmpty, typeOf } from '@ember/utils';
import BasePayload from './base-payload';

export default class extends BasePayload {
  constructor(modelName, json, converter) {
    super(modelName, json, converter);
    this.data = json.data;
    this.addProxyMethods(['includes']);
  }

  getModelPayload() {
    return this.data;
  }

  /**
   * Override base add method for special json-api handling to
   * add more things to payload like meta or more json to sideload
   *
   * @param more
   */
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
      if (typeOf(data) === 'array') {
        data.forEach((dati) => this.converter.addToIncluded(dati));
      } else {
        this.converter.addToIncluded(data);
      }
      // add all of the moreJson's includes
      this.converter.addToIncludedFromProxy(more);
    }
    return this.json;
  }

  createAttrs(data) {
    let relationships = {};
    Object.keys(data.relationships || []).forEach((key) => {
      relationships[key] = data.relationships[key].data;
    });
    let attrs = Object.assign({}, data.attributes, relationships);
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
    if (attrs[key]) {
      return attrs[key];
    }
  }

  getListKeys(key) {
    let attrs = this.data.map((data) => this.createAttrs(data));
    if (isEmpty(key)) {
      return attrs;
    }
    if (typeof key === 'number') {
      return attrs[key];
    }
  }
}
