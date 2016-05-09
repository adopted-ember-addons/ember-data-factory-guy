import Ember from 'ember';
const { pluralize, w } = Ember.String;

export default class {

  /**
   Proxy class for getting access to a json payload.
   Adds methods to json built from build and buildList methods.

   @param {String} modelName name of model for payload
   @param {Object} json json payload being proxied
   @param {Boolean} converter the converter that built this json
   */
  constructor(modelName, json, converter) {
    this.modelName = modelName;
    this.json = json;
    this.converter = converter;
    this.listType = converter.listType || false;
    this.payloadKey = this.listType ? pluralize(modelName) : modelName;
    this.proxyMethods = w("getModelPayload isProxy get add unwrap");
    this.wrap(this.proxyMethods);
  }

  /**
    Add another json payload to this one.
    Adds the main model payload and all it's includes to this json

    @param {Object} json built from FactoryGuy buildList build
    @returns {Object} the current json payload
   */
  add(/*moreJson*/) {  // each subclass does it's own thing
  }

  // marker function for saying "I am a proxy"
  isProxy() {
  }

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
    methods.forEach(method => this.json[method] = this[method].bind(this));
  }

  // remove proxy methods from json object
  unwrap() {
    this.proxyMethods.forEach(method => delete this.json[method]);
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