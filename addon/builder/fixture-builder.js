import JSONAPIFixtureConverter from '../converter/jsonapi-fixture-converter';
import Ember from 'ember';

export default class {

  constructor(store, converterClass, payloadClass) {
    this.store = store;
    this.converterClass = converterClass;
    this.payloadClass = payloadClass;
  }

  getConverter(options) {
    return new this.converterClass(this.store, options);
  }

  wrapPayload(modelName, json, converter = this.getConverter()) {
    new this.payloadClass(modelName, json, converter);
  }

  /**
   * Transform an attribute key to what the serializer would expect.
   * Key should be attribute but relationships still work.
   *
   * @param modelName
   * @param key
   * @returns {*}
   */
  transformKey(modelName, key) {
    let converter = this.getConverter();
    let model = this.store.modelFor(modelName);
    var relationshipsByName = Ember.get(model, 'relationshipsByName');
    var relationship = relationshipsByName.get(key);
    if (relationship) {
      return converter.transformRelationshipKey(relationship);
    }
    let transformKeyFunction = converter.getTransformKeyFunction(modelName, 'Attribute');
    return transformKeyFunction(key);
  }

  /**
   Normalizes the serialized model to the expected API format

   @param modelName
   @param payload
   */
  normalize(modelName, payload) {
    return payload;
  }

  /**
   Convert fixture for FactoryGuy.build

   @param modelName
   @param fixture
   @param converterOptions
   */
  convertForBuild(modelName, fixture, converterOptions) {
    let converter = this.getConverter(converterOptions);
    if (!fixture) {
      return converter.emptyResponse(modelName, converterOptions);
    }
    let json = converter.convert(modelName, fixture);
    this.wrapPayload(modelName, json, converter);
    return json;
  }
  
  /**
   Convert to the ember-data JSONAPI adapter specification, since FactoryGuy#make
   pushes jsonapi data into the store. For make builds, don't transform attr keys,
   because the json is being pushed into the store directly
   ( not going through adapter/serializer layers )

   @param {String} modelName
   @param {String} fixture
   @returns {*} new converted fixture
   */
  convertForMake(modelName, fixture) {
    let converter = new JSONAPIFixtureConverter(this.store, { transformKeys: false });
    return converter.convert(modelName, fixture);
  }

  /**
   Convert simple ( older ember data format ) error hash:

   {errors: {description: ['bad']}}

   to:

   {errors: [{detail: 'bad', source: { pointer:  "data/attributes/description"}, title: 'invalid description'}] }

   @param errors simple error hash
   @returns {{}}  JSONAPI formatted errors
   */
  convertResponseErrors(object) {
    let jsonAPIErrors = [];
    Ember.assert('[ember-data-factory-guy] Your error response must have an errors key. The errors hash format is: {errors: {name: ["name too short"]}}', object.errors);
    let errors = object.errors;
    for (let key in errors) {
      let description = Ember.typeOf(errors[key]) === "array" ? errors[key][0] : errors[key];
      let source = { pointer: "data/attributes/" + key };
      let newError = { detail: description, title: "invalid " + key, source: source };
      jsonAPIErrors.push(newError);
    }
    return { errors: jsonAPIErrors };
  }
}