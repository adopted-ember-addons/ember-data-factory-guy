import JSONAPIFixtureConverter from './jsonapi-fixture-converter';
import Ember from 'ember';

export default function(store) {
  /**
   Convert fixture for FactoryGuy.build

   @param modelName
   @param fixture
   */
  this.convertForBuild = function(modelName, fixture) {
    return fixture;
  };
  /**
   Convert to the ember-data JSONAPI adapter specification, since make pushes
   jsonapi data into the store

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
    var jsonAPIErrrors = [];
    Ember.assert('Your error REST Adapter style response must have an errors key. The errors hash format is: {errors: {description: ["bad"]}}', object.errors);
    var errors = object.errors;
    for (var key in errors) {
      var description = Ember.typeOf(errors[key]) === "array" ? errors[key][0] : errors[key];
      var source = {pointer: "data/attributes/key"+key};
      var newError = {detail: description, title: "invalid "+key, source: source};
      jsonAPIErrrors.push(newError);
    }
    return {errors: jsonAPIErrrors};
  };
}