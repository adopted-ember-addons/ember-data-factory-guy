import { isEmpty } from '@ember/utils';
import BasePayload from './base-payload';

export default class extends BasePayload {
  constructor(modelName, json, converter) {
    super(modelName, json, converter);
    this.payloadKey = converter.getPayloadKey(modelName);
    this.addProxyMethods(['includeKeys', 'getInclude']);
  }

  includeKeys() {
    let keys = Object.keys(this.json).filter((key) => this.payloadKey !== key);
    return keys.filter((key) => !this.proxyMethods.includes(key)) || [];
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
  }
}
