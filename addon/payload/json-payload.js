import Ember from 'ember';
const { String: { pluralize } } = Ember;

export default class {

  /**
   * Wrapper class for getting access to the json payload
   *
   * @param modelName
   * @param json json being proxied
   * @param listType boolean true if buildList payload
   */
  constructor(modelName, json, listType = false) {
    this.modelName = modelName;
    this.json = json;
    this.listType = listType;
    this.payloadKey = listType ? pluralize(modelName) : modelName;
    json.getModelPayload = this.getModelPayload;
    json.isProxy = ()=>true;
    json.get = (key)=>this.get(key);
    this.reserved = "getModelPayload isProxy get".w();
  }

  addReservedKeys(keys) {
    this.reserved = this.reserved.concat(keys);
  }

  // could be asking for attribute like 'id' or 'name',
  // or relationship name which returns attributes
  // no arg would be like unwrap, and return attributes
  get(key) {
    if (this.listType) {
      return this.getListKeys(key);
    }
    return this.getObjectKeys(key);
  }

}