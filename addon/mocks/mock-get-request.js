import Ember from 'ember';
import FactoryGuy from '../factory-guy';
import DS from 'ember-data';
import MockRequest from './mock-request';
const assign = Ember.assign || Ember.merge;

class MockGetRequest extends MockRequest {

  constructor(modelName) {
    super(modelName);
    this.responseJson = FactoryGuy.fixtureBuilder.convertForBuild(modelName, {});
    this.validReturnsKeys = [];
  }

  setValidReturnsKeys(validKeys) {
    this.validReturnsKeys = validKeys;
  }

  validateReturnsOptions(options) {
    const responseKeys = Object.keys(options);
    Ember.assert(`[ember-data-factory-guy] You can pass zero or one one output key to 'returns',
                you passed these keys: ${responseKeys}`, responseKeys.length <= 1);

    const [ responseKey ] = responseKeys;
    Ember.assert(`[ember-data-factory-guy] You passed an invalid key for 'returns' function.
      Valid keys are ${this.validReturnsKeys}. You used this key: ${responseKey}`,
      Ember.A(this.validReturnsKeys).contains(responseKey));

    return responseKey;
  }

  returns(options = {}) {
    let responseKey = this.validateReturnsOptions(options);
    this._setReturns(responseKey, options);
    return this;
  }

  _setReturns(responseKey, options) {
    let json, model, models;
    switch (responseKey) {

      case 'id':
         model = FactoryGuy.store.peekRecord(this.modelName, options.id);

        Ember.assert(`argument ( id ) should refer to a model of type ${this.modelName} that is in
         the store. But no ${this.modelName} with id ${options.id} was found in the store`,
          (model instanceof DS.Model && model.constructor.modelName === this.modelName));

        return this.returns({ model });

      case 'model':
        model = options.model;

        Ember.assert(`argument ( model ) must be a DS.Model instance - found type:'
          ${Ember.typeOf(model)}`, (model instanceof DS.Model));

        json = { id: model.id, type: model.constructor.modelName };
        this.responseJson = FactoryGuy.fixtureBuilder.convertForBuild(this.modelName, json);
        break;

      case 'ids':
        const store = FactoryGuy.store;
        models = options.ids.map((id)=> store.peekRecord(this.modelName, id));
        return this.returns({ models });

      case 'models':
        models = options.models;
        Ember.assert(`argument ( models ) must be an array - found type:'
          ${Ember.typeOf(models)}`, Ember.isArray(models));

        json = models.map(function(model) {
          return { id: model.id, type: model.constructor.modelName };
        });

        json = FactoryGuy.fixtureBuilder.convertForBuild(this.modelName, json);
        this.setResponseJson(json);
        break;

      case 'json':
        this.responseJson = options.json;
        break;

      case 'attrs':
        let currentId = this.responseJson.get('id');
        let modelParams = assign({id: currentId}, options.attrs);
        json = FactoryGuy.fixtureBuilder.convertForBuild(this.modelName, modelParams);
        this.setResponseJson(json);
        break;

      case 'headers':
        this.addResponseHeaders(options.headers);
        break;
    }
  }

  setResponseJson(json) {
    this.responseJson = json;
  }

  paramsMatch() {
    return true;
  }

  extraRequestMatches(settings) {
    return this.paramsMatch(settings);
  }

  //////////////////  deprecated /////////////////////
  returnsModels(models) {
    Ember.deprecate("`returnsModel` has been deprecated. Use `returns({ model })` instead.",
      false, { id: 'ember-data-factory-guy.returns-models', until: '2.4.0' });
    return this.returns({ models });
  }

  returnsJSON(json) {
    Ember.deprecate("`returnsJSON - has been deprecated. Use `returns({ json })` instead", false,
      { id: 'ember-data-factory-guy.returns-json', until: '2.4.0' });
    return this.returns({ json });
  }

  returnsExistingIds(ids) {
    Ember.deprecate("`returnsExistingIds` - has been deprecated. Use `returns({ ids })` method instead`",
      false, { id: 'ember-data-factory-guy.returns-json', until: '2.4.0' });

    return this.returns({ ids });
  }

  andFail(options = {}) {
    Ember.deprecate("`andFail` - has been deprecated. Use `fails(options)` method instead`",
      false, { id: 'ember-data-factory-guy.and-fail', until: '2.4.0' });
    return this.fails(options);
  }

  andSucceed(options) {
    Ember.deprecate("`andSucceed` - has been deprecated. Use `succeeds(options)` method instead`",
      false, { id: 'ember-data-factory-guy.and-succeed', until: '2.4.0' });
    return this.succeeds(options);
  }

}

export default MockGetRequest;
