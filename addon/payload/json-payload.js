import Ember from 'ember';
const { pluralize } = Ember.String;

export default class {

  /**
   Proxy class for getting access to a json payload.
   Used to proxy for json built from build and buildList methods.

   @param modelName
   @param json json being proxied
   @param listType boolean true if buildList payload
   */
  constructor(modelName, json, listType = false) {
    this.modelName = modelName;
    this.json = json;
    this.listType = listType;
    this.payloadKey = listType ? pluralize(modelName) : modelName;
    json.getModelPayload = this.getModelPayload;
    json.isProxy = ()=>true;
    json.get = (key)=>this.get(key);
    this.proxyMethods = "getModelPayload isProxy get unwrap".w();
    json.unwrap = ()=> this.unwrap();
  }

  // each subclass has unique proxy methods to add to the basic
  addProxyMethods(keys) {
    this.proxyMethods = this.proxyMethods.concat(keys);
  }

  // remove all proxied methods
  unwrap() {
    this.proxyMethods.forEach((method)=> {
      delete this.json[method];
    });
  }

  /**
   Main access point for most users to get data from the
   json payload

   Could be asking for attribute like 'id' or 'name',
   or index into list for list type

   @param key
   @returns {*}
   */
  get(key) {
    if (this.listType) {
      return this.getListKeys(key);
    }
    return this.getObjectKeys(key);
  }

}