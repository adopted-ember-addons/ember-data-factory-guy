import Ember from 'ember';
import FactoryGuy from './factory-guy';
import DS from 'ember-data';
import $ from 'jquery';

let MockGetRequest = function(modelName) {
  let status = 200;
  let succeed = true;
  let responseHeaders = {};
  let responseJson = FactoryGuy.getFixtureBuilder().convertForBuild(modelName, {});
  let validReturnsKeys = [];

  this.setValidReturnsKeys = function(validKeys) {
    validReturnsKeys = validKeys;
  };

  this.validateReturnsOptions = function(options) {
    const responseKeys = Object.keys(options);
    Ember.assert(`[ember-data-factory-guy] You can pass zero or one one output key to 'returns',
                you passed these keys: ${responseKeys}`, responseKeys.length <= 1);

    const [ responseKey ] = responseKeys;
    Ember.assert(`[ember-data-factory-guy] You passed an invalid key for 'returns' function.
      Valid keys are ${validReturnsKeys}. You used this key: ${responseKey}`,
      validReturnsKeys.contains(responseKey));

    return responseKey;
  };

  this.returns = function(options = {}) {
    let responseKey = this.validateReturnsOptions(options);
    this._setReturns(responseKey, options);
    return this;
  };

  this._setReturns = function(responseKey, options) {
    let json, model, models;
    switch (responseKey) {

      case 'id':
         model = FactoryGuy.get('store').peekRecord(modelName, options.id);

        Ember.assert(`argument ( id ) should refer to a model of type ${modelName} that is in
         the store. But no ${modelName} with id ${options.id} was found in the store`,
          (model instanceof DS.Model && model.constructor.modelName === modelName));

        return this.returns({ model });

      case 'model':
        model = options.model;

        Ember.assert(`argument ( model ) must be a DS.Model instance - found type:'
          ${Ember.typeOf(model)}`, (model instanceof DS.Model));

        json = { id: model.id, type: model.constructor.modelName };
        responseJson = FactoryGuy.getFixtureBuilder().convertForBuild(modelName, json);
        break;

      case 'ids':
        models = options.ids.map(function(id) {
          return FactoryGuy.get('store').peekRecord(modelName, id);
        });
        return this.returns({ models });

      case 'models':
        models = options.models;
        Ember.assert(`argument ( models ) must be an array - found type:'
          ${Ember.typeOf(models)}`, Ember.isArray(models));

        json = models.map(function(model) {
          return { id: model.id, type: model.constructor.modelName };
        });

        json = FactoryGuy.getFixtureBuilder().convertForBuild(modelName, json);
        this.setResponseJson(json);
        break;

      case 'json':
        responseJson = options.json;
        break;

      case 'headers':
        this.addResponseHeaders(options.headers);
        break;
    }
  };

  this.getUrl = function() {
    return FactoryGuy.buildURL(modelName);
  };

  this.setResponseJson = function(json) {
    responseJson = json;
  };

  this.addResponseHeaders = function(headers) {
    Ember.merge(responseHeaders, headers);
  };

  this.succeeds = function(options) {
    succeed = true;
    status = options && options.status || 200;
    return this;
  };

  this.fails = function (options = {}) {
    succeed = false;
    status = options.status || 500;
    if (options.response) {
      let errors = FactoryGuy.getFixtureBuilder().convertResponseErrors(options.response);
      responseJson = errors;
    }
    return this;
  };

  this.getSucceed = function() {
    return succeed;
  };

  this.getResponseJson = function() {
    return responseJson;
  };

  this.getResponse = function() {
    return {
      responseText: responseJson,
      headers: responseHeaders,
      status: status
    };
  };

  this.paramsMatch = function() {
    return true;
  };

  //////////////  common handler for all get requests ////////////
  let self = this;
  let handler = function(settings) {
    let url = self.getUrl();
    if (!(settings.url === url && settings.type === "GET")) {
      return false;
    }
    if (self.getSucceed() && !self.paramsMatch(settings)) {
      return false;
    }
    return self.getResponse();
  };

  $.mockjax(handler);

  //////////////////  deprecated /////////////////////
  this.returnsModels = function(models) {
    Ember.deprecate("`returnsModel` has been deprecated. Use `returns({ model })` instead.",
      false, { id: 'ember-data-factory-guy.returns-models', until: '2.4.0' });
    return this.returns({ models });
  };

  this.returnsJSON = function(json) {
    Ember.deprecate("`returnsJSON - has been deprecated. Use `returns({ json })` instead", false,
      { id: 'ember-data-factory-guy.returns-json', until: '2.4.0' });
    return this.returns({ json });
  };

  this.returnsExistingIds = function(ids) {
    Ember.deprecate("`returnsExistingIds` - has been deprecated. Use `returns({ ids })` method instead`",
      false, { id: 'ember-data-factory-guy.returns-json', until: '2.4.0' });

    return this.returns({ ids });
  };

  this.andFail = function(options = {}) {
    Ember.deprecate("`andFail` - has been deprecated. Use `fails(options)` method instead`",
      false, { id: 'ember-data-factory-guy.and-fail', until: '2.4.0' });
    return this.fails(options);
  };

  this.andSucceed = function(options) {
    Ember.deprecate("`andSucceed` - has been deprecated. Use `succeeds(options)` method instead`",
      false, { id: 'ember-data-factory-guy.and-succeed', until: '2.4.0' });
    return this.succeeds(options);
  };

};

export default MockGetRequest;
