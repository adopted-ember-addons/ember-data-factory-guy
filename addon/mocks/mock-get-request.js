/* Disabling the `ember/no-get` lint rule as `MockStoreRequest` and `MockGetRequest` contains a `this.get` method */
/* eslint-disable ember/no-get */
import { assert } from '@ember/debug';
import { typeOf } from '@ember/utils';
import { isArray } from '@ember/array';
import { assign } from '@ember/polyfills';
import FactoryGuy from '../factory-guy';
import Model from '@ember-data/model';
import MockStoreRequest from './mock-store-request';

class MockGetRequest extends MockStoreRequest {
  constructor(modelName, requestType, { defaultResponse, queryParams } = {}) {
    super(modelName, requestType);
    this.queryParams = queryParams;
    if (defaultResponse !== undefined) {
      this.setResponseJson(
        this.fixtureBuilder.convertForBuild(modelName, defaultResponse)
      );
    }
    this.validReturnsKeys = [];
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

    assert(
      `[ember-data-factory-guy] You can pass one key to 'returns',
                you passed these keys: ${responseKeys}`,
      responseKeys.length === 1
    );

    const [responseKey] = responseKeys;

    assert(
      `[ember-data-factory-guy] You passed an invalid keys for 'returns' function.
      Valid keys are ${this.validReturnsKeys}. You used this invalid key: ${responseKey}`,
      this.validReturnsKeys.includes(responseKey)
    );

    return responseKey;
  }

  returns(options = {}) {
    let responseKey = this.validateReturnsOptions(options);
    this.setReturns(responseKey, options);
    return this;
  }

  setReturns(responseKey, options) {
    let json,
      model,
      models,
      modelName = this.modelName;

    switch (responseKey) {
      case 'id':
        // if you want to return existing model with an id, set up the json
        // as if it might be found, but check later during request match to
        // see if it really exists
        json = { id: options.id };
        this.idSearch = true;
        this.setResponseJson(
          this.fixtureBuilder.convertForBuild(modelName, json)
        );
        break;

      case 'model':
        model = options.model;

        assert(
          `[ember-data-factory-guy] argument ( model ) must be a Model instance - found type:'
          ${typeOf(model)}`,
          model instanceof Model
        );

        json = { id: model.id };
        this.setResponseJson(
          this.fixtureBuilder.convertForBuild(modelName, json)
        );
        break;

      case 'ids': {
        const store = FactoryGuy.store;
        models = options.ids.map((id) => store.peekRecord(modelName, id));
        this.returns({ models });
        break;
      }
      case 'models': {
        models = options.models;
        assert(
          `[ember-data-factory-guy] argument ( models ) must be an array - found type:'
          ${typeOf(models)}`,
          isArray(models)
        );

        json = models.map((model) => ({ id: model.id }));

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
        let currentId = this.responseJson.get('id'),
          modelParams = assign({ id: currentId }, options.attrs);
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
}

export default MockGetRequest;
