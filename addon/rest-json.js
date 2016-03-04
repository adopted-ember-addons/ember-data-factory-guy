import Ember from 'ember';

export default class {

  constructor(modelName, json) {
    this.modelName = modelName;
    this.json = json;
  }

  get(key) {
    let attrs = this.json[Object.getOwnPropertyNames(this.json)[0]];
    if (attrs === "array") {
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
    } else {
      if (Ember.isEmpty(key)) {
        return attrs;
      }
      return attrs[key];
    }
  }
}