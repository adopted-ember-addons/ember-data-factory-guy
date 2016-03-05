import JSONPayload from './json-payload';

export default class extends JSONPayload {

  constructor(modelName, json, listType) {
    super(modelName, json, listType);
  }

  includeKeys() {
    return Object.keys(this.json).reject((modelType)=> {
      return this.modelName === modelType || this.reserved.contains(modelType);
    });
  }

  getInclude(modelType) {
    return this.json[modelType];
  }

  getObjectKeys(key, attrs) {
    if (Ember.isEmpty(key)) {
      return attrs;
    }
    return attrs[key];
  }

  getListKeys(key, attrs) {
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