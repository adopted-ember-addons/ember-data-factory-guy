import JSONAPIFixtureConverter from './jsonapi-fixture-converter';
import Ember from 'ember';

export default function(store) {
  /**
   Normalizes the serialized model to the expected API format

   @param modelName
   @param payload
   */
  this.normalize = function (modelName, payload) {
    return payload;
  };
  /**
   Returns the ID for the model payload

   @param modelName
   @param payload
   */
  this.extractId = function (modelName, payload) {
    return payload.id;
  };
  /**
   Convert fixture for FactoryGuy.build

   @param modelName
   @param fixture
   */
  this.convertForBuild = function(modelName, fixture) {
    return fixture;
  };
  /**
   Convert to the ember-data JSONAPI adapter specification, since FactoryGuy#make
   pushes jsonapi data into the store

   @param {String} modelName
   @param {String} fixture
   @returns {*} new converted fixture
   */
  this.convertForMake = function (modelName, fixture) {
    return new JSONAPIFixtureConverter(store).convert(modelName, fixture);
  };

  /**
   Convert simple ( older ember data format ) error hash:

   {errors: {description: ['bad']}}

   to:

   {errors: [{detail: 'bad', source: { pointer:  "data/attributes/description"}, title: 'invalid description'}] }

   @param errors simple error hash
   @returns {{}}  JSONAPI formatted errors
   */
  this.convertResponseErrors = function (object) {
    let jsonAPIErrrors = [];
    Ember.assert('Your error REST Adapter style response must have an errors key. The errors hash format is: {errors: {description: ["bad"]}}', object.errors);
    let errors = object.errors;
    for (let key in errors) {
      let description = Ember.typeOf(errors[key]) === "array" ? errors[key][0] : errors[key];
      let source = {pointer: "data/attributes/key"+key};
      let newError = {detail: description, title: "invalid "+key, source: source};
      jsonAPIErrrors.push(newError);
    }
    return {errors: jsonAPIErrrors};
  };
}
