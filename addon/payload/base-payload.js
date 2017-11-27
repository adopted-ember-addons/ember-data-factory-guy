import Ember from 'ember';
const { w } = Ember.String;
import { assign } from '@ember/polyfills';

export default class {

  /**
   Proxy class for getting access to a json payload.
   Allows you to:
     - inspect a payload with friendly .get(attr)  syntax
     - add to json payload with more json built from build and buildList methods.

   @param {String} modelName name of model for payload
   @param {Object} json json payload being proxied
   @param {Boolean} converter the converter that built this json
   */
  constructor(modelName, json, converter) {
    this.modelName = modelName;
    this.json = json;
    this.converter = converter;
    this.listType = converter.listType || false;
    this.proxyMethods = w("getModelPayload isProxy get add unwrap");
    this.wrap(this.proxyMethods);
  }

  /**
   Add another json payload or meta data to this payload

   Typically you would build a payload and add that to another one

   Usage:
   ```
   let batMen = buildList('bat_man', 2);
   let user = build('user').add(batMen);
   ```

   but you can also add meta data:
   ```
   let user = buildList('user', 2).add({meta: { next: '/url?page=3', previous: '/url?page=1'}});
   ```

   @param {Object} optional json built from FactoryGuy build or buildList or
   meta data to add to payload
   @returns {Object} the current json payload
   */
  add(more) {
    this.converter.included = this.json;
    Ember.A(Object.getOwnPropertyNames(more))
      .reject(key=> Ember.A(this.proxyMethods).includes(key))
      .forEach(key=> {
        if (Ember.typeOf(more[key]) === "array") {
          more[key].forEach(data=> this.converter.addToIncluded(data, key));
        } else {
          if (key === "meta") {
            this.addMeta(more[key]);
          } else {
            this.converter.addToIncluded(more[key], key);
          }
        }
      });
    return this.json;
  }

  /**
    Add new meta data to the json payload, which will
    overwrite any existing meta data with same keys

    @param {Object} data meta data to add
   */
  addMeta(data) {
    this.json.meta = this.json.meta || {};
    assign(this.json.meta, data);
  }

  // marker function for saying "I am a proxy"
  isProxy() {
  }

  // get the top level model's payload ( without the includes or meta data )
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
   or index into list for list type like 0 or 1

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
