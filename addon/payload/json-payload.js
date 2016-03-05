import Ember from 'ember';
const {
        String: { pluralize }
        } = Ember;

export default class {

  constructor(modelName, json, listType = false) {
    this.modelName = modelName;
    this.json = json;
    this.payloadKey = listType ? pluralize(modelName) : modelName;
    json.isProxy = ()=>true;
    json.get = (key)=>this.get(key);
    json.includeKeys = (key)=>this.includeKeys(key);
    json.getInclude = (key)=>this.getInclude(key);
    this.reserved = "getInclude includeKeys get isProxy".w();
  }

  // could be asking for attribute like 'id' or 'name',
  // or relationship name which returns attributes
  // no arg would be like unwrap, and return attributes
  get(key) {
    let attrs = this.json[this.payloadKey];
    if (this.listType) {
      return this.getListKeys(key, attrs);
    }
    return this.getObjectKeys(key, attrs);
  }

}