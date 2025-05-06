import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';
import BasePayload from './base-payload';

export default class extends BasePayload {
  constructor(modelName, json, converter) {
    super(modelName, json, converter);
    this.payloadKey = converter.getPayloadKey(modelName);
    this.addProxyMethods(['includeKeys', 'getInclude']);
  }

  includeKeys() {
    let keys = A(Object.keys(this.json)).reject(
      (key) => this.payloadKey === key
    );
    return A(keys).reject((key) => A(this.proxyMethods).includes(key)) || [];
  }

  getInclude(modelType) {
    return this.json[modelType];
  }

  getObjectKeys(key) {
    let attrs = this.json[this.payloadKey];
    if (isEmpty(key)) {
      return attrs;
    }
    return attrs[key];
  }

  getListKeys(key) {
    let attrs = this.json[this.payloadKey];
    if (isEmpty(key)) {
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
