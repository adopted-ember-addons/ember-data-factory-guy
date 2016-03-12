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
    this.proxyMethods = "getModelPayload isProxy get unwrap".w();
    this.wrap(this.proxyMethods);
  }

  // marker function for saying "I am a proxy"
  isProxy() {}

  // get the top level model from the json payload
  getModelPayload() {
    return this.get();
  }

  // each subclass has unique proxy methods to add to the basic
  addProxyMethods(methods) {
    this.proxyMethods = this.proxyMethods.concat(methods);
    this.wrap(methods);
  }

  // add proxy methods to json object
  wrap(methods) {
    methods.forEach( method => this.json[method] = this[method].bind(this));
  }

  // remove proxy methods to json object
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