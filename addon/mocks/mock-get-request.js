import Ember from 'ember';
import FactoryGuy from '../factory-guy';
import Model from 'ember-data/model';
import MockStoreRequest from './mock-store-request';
import { toParams, isEquivalent, isEmptyObject, isPartOf } from '../utils/helper-functions';

const assign = Ember.assign || Ember.merge;

class MockGetRequest extends MockStoreRequest {

  constructor(modelName, requestType, defaultResponse) {
    super(modelName, requestType);
    if (defaultResponse !== undefined) {
      this.setResponseJson(this.fixtureBuilder.convertForBuild(modelName, defaultResponse));
    }
    this.validReturnsKeys = [];
    this.queryParams = {};
  }

  /**
   Used for inspecting the response that this mock will generate

   Usually the args will be an attribute like 'id', but it might
   also be a number like 0 or 1 for and index to list types.

   Ideally the responseJson is a JSONProxy class so the logic can be handed off there.
   Otherwise it's a plain object which is rare ( so the logic is not great )

   @param args
   @returns {*}
   */
  get(args) {
    let json = this.responseJson;
    if (json) {
      if (json.get) {
        return json.get(args);
      }
      // if this becomes issue, make this search more robust
      return json[args];
    }
  }

  setValidReturnsKeys(validKeys) {
    this.validReturnsKeys = validKeys;
  }

  validateReturnsOptions(options) {
    const responseKeys = Object.keys(options);

    Ember.assert(`[ember-data-factory-guy] You can pass one key to 'returns',
                you passed these keys: ${responseKeys}`, responseKeys.length === 1);

    const [responseKey] = responseKeys;

    Ember.assert(`[ember-data-factory-guy] You passed an invalid keys for 'returns' function.
      Valid keys are ${this.validReturnsKeys}. You used this invalid key: ${responseKey}`,
      this.validReturnsKeys.includes(responseKey));

    return responseKey;
  }

  returns(options = {}) {
    let responseKey = this.validateReturnsOptions(options);
    this.setReturns(responseKey, options);
    return this;
  }

  setReturns(responseKey, options) {
    let json, model, models, modelName = this.modelName;

    switch (responseKey) {
      case 'id':
        // if you want to return existing model with an id, set up the json
        // as if it might be found, but check later during request match to
        // see if it really exists
        json = {id: options.id};
        this.idSearch = true;
        this.setResponseJson(this.fixtureBuilder.convertForBuild(modelName, json));
        break;

      case 'model':
        model = options.model;

        Ember.assert(`argument ( model ) must be a Model instance - found type:'
          ${Ember.typeOf(model)}`, (model instanceof Model));

        json = {id: model.id};
        this.setResponseJson(this.fixtureBuilder.convertForBuild(modelName, json));
        break;

      case 'ids': {
        const store = FactoryGuy.store;
        models = options.ids.map((id) => store.peekRecord(modelName, id));
        this.returns({models});
        break;
      }
      case 'models': {
        models = options.models;
        Ember.assert(`argument ( models ) must be an array - found type:'
          ${Ember.typeOf(models)}`, Ember.isArray(models));

        json = models.map(model => {
          return {id: model.id}
        });

        json = this.fixtureBuilder.convertForBuild(modelName, json);
        this.setResponseJson(json);
        break;
      }
      case 'json':
        json = options.json;
        if (!json.get) {
          // need to wrap a payload so the json can at least respond to 'get' method
          this.fixtureBuilder.wrapPayload(modelName, json);
        }
        this.setResponseJson(json);
        break;

      case 'attrs': {
        let currentId   = this.responseJson.get('id'),
            modelParams = assign({id: currentId}, options.attrs);
        json = this.fixtureBuilder.convertForBuild(modelName, modelParams);
        this.setResponseJson(json);
        break;
      }
      case 'headers':
        this.addResponseHeaders(options.headers);
        break;
    }
  }

  setResponseJson(json) {
    this.responseJson = json;
    this.setupHandler();
  }

  withParams(queryParams) {
    this.queryParams = queryParams;
    return this;
  }

  withSomeParams(someQueryParams) {
    this.someQueryParams = someQueryParams;
    return this;
  }

  paramsMatch(request) {
    if (!isEmptyObject(this.someQueryParams)) {
      return isPartOf(request.queryParams, toParams(this.someQueryParams));
    }
    if (!isEmptyObject(this.queryParams)) {
      return isEquivalent(request.queryParams, toParams(this.queryParams));
    }
    return true;
  }

  extraRequestMatches(settings) {
    return this.paramsMatch(settings);
  }

}

export default MockGetRequest;
