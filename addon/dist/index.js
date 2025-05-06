import { getContext } from '@ember/test-helpers';
import { i as isEmptyObject, f as factoryGuy, a as isEquivalent, M as MockStoreRequest, e as MockRequest, b as isPartOf, d as paramsFromRequestBody, t as toParams, c as parseUrl, R as RequestManager, m as make, g as makeNew, h as makeList, j as build, k as buildList, l as attributesFor } from './mock-store-request-DgU0Uibs.js';
export { A as ActiveModelFixtureBuilder, o as JSONAPIFixtureBuilder, J as JSONFixtureBuilder, q as MissingSequenceError, n as RESTFixtureBuilder } from './mock-store-request-DgU0Uibs.js';
import { typeOf, isPresent } from '@ember/utils';
import { assert } from '@ember/debug';
import Model from '@ember-data/model';
import { isArray } from '@ember/array';

/**
 This is tricky, but the main idea here is:

 #1 Take the keys they want to match and transform them to what the serialized
 version would be ie. company => company_id

 #2 Take the matchArgs and turn them into a FactoryGuy payload class by
 FactoryGuy.build(ing) them into a payload

 #3 Wrap the request data into a FactoryGuy payload class

 #4 Go though the keys from #1 and check that both the payloads from #2/#3 have the
 same values

 @param requestData
 @returns {boolean} true is no attributes to match or they all match
 */
const attributesMatch = function (requestData, modelName, matchParams) {
  if (isEmptyObject(matchParams)) {
    return true;
  }
  let builder = factoryGuy.fixtureBuilder(modelName);

  // transform they match keys
  let matchCheckKeys = Object.keys(matchParams).map(key => {
    return builder.transformKey(modelName, key);
  });
  // build the match args into a JSONPayload class
  let buildOpts = {
    serializeMode: true,
    transformKeys: true
  };
  let expectedData = builder.convertForBuild(modelName, matchParams, buildOpts);

  // wrap request data in a JSONPayload class
  builder.wrapPayload(modelName, requestData);

  // success if all values match
  return matchCheckKeys.every(key => {
    return isEquivalent(expectedData.get(key), requestData.get(key));
  });
};

/**
 This is a mixin used by MockUpdate and MockCreateRequest

 Make sure you setup the constructor in the class that uses this mixin
 to set the matchArgs variable

 Example:

 ```
 constructor(modelName, id) {
   super(modelName);
   this.matchArgs = {};
 }
 ```

 @param superclass
 @constructor
 */
const AttributeMatcher = superclass => class extends superclass {
  match(matches) {
    this.matchArgs = matches;
    return this;
  }

  /**
  Update and Create mocks can accept 2 return keys 'attrs' and 'add'
  @param options
  @returns {Array}
  */
  validateReturnsOptions(options) {
    const responseKeys = Object.keys(options),
      validReturnsKeys = ['attrs', 'add'],
      invalidKeys = responseKeys.filter(key => !validReturnsKeys.includes(key));
    assert(`[ember-data-factory-guy] You passed invalid keys for 'returns' function.
      Valid keys are ${validReturnsKeys}. You used these invalid keys: ${invalidKeys}`, invalidKeys.length === 0);
    return responseKeys;
  }
  extraRequestMatches(request) {
    if (this.matchArgs) {
      let requestBody = request.requestBody;
      if (typeOf(requestBody) === 'string') {
        requestBody = JSON.parse(requestBody);
      }
      if (typeOf(this.matchArgs) === 'function') {
        return this.matchArgs(requestBody);
      } else {
        return attributesMatch(requestBody, this.modelName, this.matchArgs);
      }
    }
    return true;
  }
};

/**
 This is a mixin used by Mocks that might match on id or not depending if id exists

 @param superclass
 @constructor
 */
const MaybeIdUrlMatch = superclass => class extends superclass {
  /**
  Used by getUrl to => this.get('id')
  For mockDelete: If the id is null, the url will not include the id, and
  can therefore be used to match any delete for this modelName
  */
  get(...args) {
    if (args[0] === 'id') {
      return this.id;
    }
  }

  /**
   *
   * @returns {String} url
   */
  getUrl() {
    let url = super.getUrl();
    if (!this.id) {
      url = `${url}/:id`;
    }
    return url;
  }
};

class MockUpdateRequest extends MaybeIdUrlMatch(AttributeMatcher(MockStoreRequest)) {
  constructor(modelName, {
    id,
    model
  } = {}) {
    super(modelName, 'updateRecord');
    this.id = id;
    this.model = model;
    this.returnArgs = {};
    this.matchArgs = {};
    this.setupHandler();
  }
  getType() {
    return factoryGuy.updateHTTPMethod(this.modelName);
  }

  /**
   This returns only accepts attrs key
    These attrs are those attributes or relationships that
   you would like returned with the model when the update succeeds.
    You can't user returns if you use mockUpdate with only a modelName like:
   mockUpdate('user'); ( no id specified )
    @param {Object} returns attributes and or relationships to send with payload
   */
  returns(returns) {
    this.validateReturnsOptions(returns);
    assert(`[ember-data-factory-guy] Can't use returns in
      mockUpdate when update only has modelName and no id`, this.id);
    this.returnArgs = returns.attrs;
    this.add = returns.add;
    return this;
  }

  /**
   Adapters freak out if update payload is non empty and there is no id.
    So, if you use mockUpdate like this:
   mockUpdate('user'); ( no id specified ) this mock will return null
    @returns {*}
   */
  getResponse() {
    this.responseJson = null;
    if (Object.keys(this.returnArgs).length) {
      let args = Object.assign({}, this.matchArgs, this.returnArgs),
        json = Object.assign({}, args, {
          id: this.id
        });
      this.responseJson = this.fixtureBuilder.convertForBuild(this.modelName, json);
    }
    return super.getResponse();
  }
}

class MockCreateRequest extends AttributeMatcher(MockStoreRequest) {
  constructor(modelName, {
    model
  } = {}) {
    super(modelName, 'createRecord');
    this.model = model;
    this.returnArgs = {};
    this.matchArgs = {};
    this.setupHandler();
  }
  getType() {
    return 'POST';
  }

  /**
   This returns only accepts attrs key
   These attrs are those attributes or relationships that
   you would like returned with the model when the create succeeds.
    @param {Object} returns attributes and or relationships to return with payload
   */
  returns(returns) {
    this.validateReturnsOptions(returns);
    this.returnArgs = returns.attrs;
    return this;
  }

  /**
   Unless the id is setup already in the return args, then setup a new id.
   */
  modelId() {
    let returnArgs = this.returnArgs;
    if (isPresent(returnArgs) && isPresent(returnArgs['id'])) {
      return returnArgs['id'];
    } else {
      let definition = factoryGuy.findModelDefinition(this.modelName);
      return definition.nextId();
    }
  }

  /**
   This mock might be called a few times in a row so,
   Need to clone the responseJson and add id at the very last minute
   */
  getResponse() {
    let args = Object.assign({}, this.matchArgs, this.returnArgs),
      json = Object.assign({}, args, {
        id: this.modelId()
      });
    this.responseJson = this.fixtureBuilder.convertForBuild(this.modelName, json);
    return super.getResponse();
  }
}

/* Disabling the `ember/no-get` lint rule as `MockStoreRequest` and `MockGetRequest` contains a `this.get` method */
/* eslint-disable ember/no-get */
class MockGetRequest extends MockStoreRequest {
  constructor(modelName, requestType, {
    defaultResponse,
    queryParams
  } = {}) {
    super(modelName, requestType);
    this.queryParams = queryParams;
    if (defaultResponse !== undefined) {
      this.setResponseJson(this.fixtureBuilder.convertForBuild(modelName, defaultResponse));
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
    assert(`[ember-data-factory-guy] You can pass one key to 'returns',
                you passed these keys: ${responseKeys}`, responseKeys.length === 1);
    const [responseKey] = responseKeys;
    assert(`[ember-data-factory-guy] You passed an invalid keys for 'returns' function.
      Valid keys are ${this.validReturnsKeys}. You used this invalid key: ${responseKey}`, this.validReturnsKeys.includes(responseKey));
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
        json = {
          id: options.id
        };
        this.idSearch = true;
        this.setResponseJson(this.fixtureBuilder.convertForBuild(modelName, json));
        break;
      case 'model':
        model = options.model;
        assert(`[ember-data-factory-guy] argument ( model ) must be a Model instance - found type:'
          ${typeOf(model)}`, model instanceof Model);
        json = {
          id: model.id
        };
        this.setResponseJson(this.fixtureBuilder.convertForBuild(modelName, json));
        break;
      case 'ids':
        {
          const store = factoryGuy.store;
          models = options.ids.map(id => store.peekRecord(modelName, id));
          this.returns({
            models
          });
          break;
        }
      case 'models':
        {
          models = options.models;
          assert(`[ember-data-factory-guy] argument ( models ) must be an array - found type:'
          ${typeOf(models)}`, isArray(models));
          json = models.map(model => ({
            id: model.id
          }));
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
      case 'attrs':
        {
          let currentId = this.responseJson.get('id'),
            modelParams = Object.assign({
              id: currentId
            }, options.attrs);
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

class MockQueryRequest extends MockGetRequest {
  /**
   * By default this query will return a payload of [] or empty array
   *
   * @param modelName
   * @param queryParams
   */
  constructor(modelName, queryParams = {}) {
    super(modelName, 'query', {
      defaultResponse: [],
      queryParams
    });
    this.setValidReturnsKeys(['models', 'json', 'ids', 'headers']);
  }
}

class MockQueryRecordRequest extends MockGetRequest {
  /**
   * By default this query will return a payload of 'null' or no result
   *
   * @param modelName
   * @param queryParams
   */
  constructor(modelName, queryParams = {}) {
    super(modelName, 'queryRecord', {
      defaultResponse: null,
      queryParams
    });
    this.setValidReturnsKeys(['model', 'json', 'id', 'headers']);
  }
}

/* Disabling the following lint rules as `MockStoreRequest` and `MockGetRequest` contain a `this.get` method */
/* eslint-disable ember/no-get, ember/classic-decorator-no-classic-methods */
class MockFindRecordRequest extends MockGetRequest {
  constructor(modelName) {
    super(modelName, 'findRecord');
    this.setValidReturnsKeys(['model', 'json', 'id', 'headers']);
  }

  /**
   * When using returns({id: id}), this is flagged as an idSearch, so
   * that at the last moment when this handler is returning the request response,
   * we can check the store and see if a model with that id exists.
   *
   * If not, then this will be a 404 not found error
   *
   * @param settings
   * @returns {*}
   */
  extraRequestMatches(settings) {
    if (this.idSearch) {
      let model = factoryGuy.store.peekRecord(this.modelName, this.get('id'));
      if (!model) {
        // the match still succeeds but the response is failure
        this.fails({
          status: 404
        });
      }
    }
    return super.extraRequestMatches(settings);
  }
}

class MockReloadRequest extends MockFindRecordRequest {
  constructor(modelName) {
    super(modelName);
    this.setValidReturnsKeys(['attrs', 'json', 'headers']);
  }
}

class MockFindAllRequest extends MockGetRequest {
  constructor(modelName) {
    super(modelName, 'findAll', {
      defaultResponse: []
    });
    this.setValidReturnsKeys(['models', 'json', 'ids', 'headers']);
  }
}

class MockDeleteRequest extends MaybeIdUrlMatch(MockStoreRequest) {
  constructor(modelName, {
    id,
    model
  } = {}) {
    super(modelName, 'deleteRecord');
    this.id = id;
    this.model = model;
    this.setupHandler();
  }
  getType() {
    return 'DELETE';
  }
}

class MockAnyRequest extends MockRequest {
  constructor({
    type = 'GET',
    url,
    responseText,
    status = 200
  }) {
    super();
    this.responseJson = responseText;
    if (this.isErrorStatus(status)) this.errorResponse = responseText;
    this.url = url;
    this.type = type;
    this.status = status;
    this.setupHandler();
  }
  getUrl() {
    return this.url;
  }
  getType() {
    return this.type;
  }

  /**
   * Return some form of object
   *
   * @param json
   * @returns {*}
   */
  returns(json) {
    this.responseJson = json;
    return this;
  }
  paramsMatch(request) {
    if (!isEmptyObject(this.someQueryParams)) {
      return this._tryMatchParams(request, this.someQueryParams, isPartOf);
    }
    if (!isEmptyObject(this.queryParams)) {
      return this._tryMatchParams(request, this.queryParams, isEquivalent);
    }
    return true;
  }
  _tryMatchParams(request, handlerParams, comparisonFunction) {
    let requestParams = request.queryParams;
    if (/POST|PUT|PATCH/.test(this.type)) {
      requestParams = paramsFromRequestBody(request.requestBody);
    }
    return comparisonFunction(toParams(requestParams), toParams(handlerParams));
  }
}

class MockLinksRequest extends MockRequest {
  constructor(model, relationshipKey) {
    super();
    this.model = model;
    this.relationshipKey = relationshipKey;
    this.relationship = this.getRelationship();
    this.fixtureBuilder = factoryGuy.fixtureBuilder(this.relationship.type);
    this.setValidReturnsKeys();
    this.type = 'GET';
    this.status = 200;
    this.extractUrl();
    this.setupHandler();
  }
  getRelationship() {
    let modelClass = this.model.constructor,
      relationships = modelClass.relationshipsByName,
      relationship = relationships.get(this.relationshipKey);
    assert(`[ember-data-factory-guy] mockLinks can not find that relationship 
        [${this.relationshipKey}] on model of type ${modelClass.modelName}`, relationship);
    return relationship;
  }
  setValidReturnsKeys() {
    const isBelongsTo = this.relationship.kind === 'belongsTo',
      validKeys = isBelongsTo ? ['model', 'json'] : ['models', 'json'];
    this.validReturnsKeys = validKeys;
  }

  /**
   * Links url's could have query parameters, and this extraction will pull
   * that apart into the url and query parameters so pretender can make a match
   */
  extractUrl() {
    const url = this.model[this.relationship.kind](this.relationshipKey).link();
    const [urlPart, queryParams] = parseUrl(url);
    this.withParams(queryParams);
    this.url = urlPart;
  }
  getUrl() {
    return this.url;
  }
  getType() {
    return this.type;
  }
  validateReturnsOptions(options) {
    const responseKeys = Object.keys(options);
    assert(`[ember-data-factory-guy] You can pass one key to 'returns',
                you passed these keys: ${responseKeys}`, responseKeys.length === 1);
    const [responseKey] = responseKeys;
    assert(`[ember-data-factory-guy] You passed an invalid keys for 'returns' function.
      Valid keys are ${this.validReturnsKeys}. You used this invalid key: ${responseKey}`, this.validReturnsKeys.includes(responseKey));
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
      modelName = this.relationship.type;
    switch (responseKey) {
      case 'id':
        {
          // if you want to return existing model with an id, set up the json
          // as if it might be found, but check later during request match to
          // see if it really exists
          json = {
            id: options.id
          };
          this.idSearch = true;
          this.setResponseJson(this.fixtureBuilder.convertForBuild(modelName, json));
          break;
        }
      case 'model':
        model = options.model;
        assert(`[ember-data-factory-guy] argument ( model ) must be a Model instance - found type:'
          ${typeOf(model)}`, model instanceof Model);
        json = {
          id: model.id
        };
        this.setResponseJson(this.fixtureBuilder.convertForBuild(modelName, json));
        break;
      case 'ids':
        {
          const store = factoryGuy.store;
          models = options.ids.map(id => store.peekRecord(modelName, id));
          this.returns({
            models
          });
          break;
        }
      case 'models':
        {
          models = options.models;
          assert(`[ember-data-factory-guy] argument ( models ) must be an array - found type:'
          ${typeOf(models)}`, isArray(models));
          json = models.map(model => ({
            id: model.id
          }));
          json = this.fixtureBuilder.convertForBuild(modelName, json);
          this.setResponseJson(json);
          break;
        }
      case 'json':
        json = options.json;
        if (!json.isProxy) {
          // need to wrap a payload in proxy class if not already done so
          this.fixtureBuilder.wrapPayload(modelName, json);
        }
        this.setResponseJson(json);
        break;
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

function mock({
  type = 'GET',
  url,
  responseText,
  status
} = {}) {
  assert('[ember-data-factory-guy] mock requires at least a url', url);
  return new MockAnyRequest({
    type,
    url,
    responseText,
    status
  });
}
function mockLinks(model, relationshipKey) {
  assert('[ember-data-factory-guy] mockLinks requires at least model and relationshipKey', model, relationshipKey);
  return new MockLinksRequest(model, relationshipKey);
}

/**
 Handling ajax GET for handling finding a model
 You can mock failed find by calling `fails()`

 ```js
 // Typically you will use like:

 // To return default factory 'user'
 let mock = mockFindRecord('user');
 let userId = mock.get('id');

 // or to return custom factory built json object
 let json = build('user', 'with_whacky_name', {isDude: true});
 let mock = mockFindRecord('user').returns({json});
 let userId = json.get('id');

 // you could also make the model first and mock that find fails
 let user = make('user')
 let mock = mockFindRecord(user);
 let userId = user.id // or mock.get('id')

 // To mock failure case use method fails
 mockFindRecord('user').fails();

 // Then to 'find' the user
 store.findRecord('user', userId);

 // or in acceptance test
 visit('/user'+userId);
 ```

 @param {String} name  name of the fixture ( or modelName ) to find
 @param {String} trait  optional traits (one or more)
 @param {Object} opts  optional fixture options
 */
function mockFindRecord(...args) {
  let modelName;
  assert(`[ember-data-factory-guy] mockFindRecord requires at least a model
     name as first parameter`, args.length > 0);
  if (args[0] instanceof Model) {
    let model = args[0];
    modelName = model.constructor.modelName;
    return new MockFindRecordRequest(modelName).returns({
      model
    });
  }
  modelName = args[0];
  let json = factoryGuy.build.apply(factoryGuy, arguments);
  return new MockFindRecordRequest(modelName).returns({
    json
  });
}

/**
 Handling ajax GET for reloading a record
 You can mock failed find by calling fails

 ```js
 // Typically you will make a model
 let user = make('user');
 // and then to handle reload, use the mockReload call to mock a reload
 mockReload(user);

 // to mock failure case use method fails
 mockReload(user).fails();
 ```

 @param {String} type  model type like 'user' for User model, or a model instance
 @param {String} id  id of record to find
 */
function mockReload(...args) {
  let modelName, id;
  if (args[0] instanceof Model) {
    let record = args[0];
    modelName = record.constructor.modelName;
    id = record.id;
  } else if (typeof args[0] === 'string' && typeof parseInt(args[1]) === 'number') {
    modelName = args[0];
    id = args[1];
  }
  assert('[ember-data-factory-guy] mockReload arguments are a model instance or a model type name and an id', modelName && id);
  let json = factoryGuy.fixtureBuilder(modelName).convertForBuild(modelName, {
    id: id
  });
  return new MockReloadRequest(modelName).returns({
    json
  });
}

/**
 Handling ajax GET for finding all records for a type of model.
 You can mock failed find by passing in success argument as false.

 ```js
 // Pass in the parameters you would normally pass into FactoryGuy.makeList,
 // like fixture name, number of fixtures to make, and optional traits,
 // or fixture options
 let mockFindAll = mockFindAll('user', 2, 'with_hats');

 // or to return custom FactoryGuy built json object
 let json = FactoryGuy.buildList('user', 'with_whacky_name', {isDude: true});
 let mockFindAll = mockFindAll('user').returns({json});

 store.findAll('user').then(function(users){
      // 2 users, first with whacky name, second isDude
   });
 ```

 @param {String} name  name of the fixture ( or model ) to find
 @param {Number} number  number of fixtures to create
 @param {String} trait  optional traits (one or more)
 @param {Object} opts  optional fixture options
 */
function mockFindAll(...args) {
  let modelName = args[0];
  assert(`[ember-data-factory-guy] mockFindAll requires at least a model
     name as first parameter`, args.length > 0);
  let mock = new MockFindAllRequest(modelName);
  if (args.length > 1) {
    let json = factoryGuy.buildList.apply(factoryGuy, args);
    mock.returns({
      json
    });
  }
  return mock;
}

/**
 Handling ajax GET for finding all records for a type of model with query parameters.


 ```js

 // Create model instances
 let users = FactoryGuy.makeList('user', 2, 'with_hats');

 // Pass in the array of model instances as last argument
 mockQuery('user', {name:'Bob', age: 10}).returns({models: users});

 store.query('user', {name:'Bob', age: 10}}).then(function(userInstances){
     // userInstances will be the same of the users that were passed in
   })
 ```

 By omitting the last argument (pass in no records), this simulates a findQuery
 request that returns no records

 ```js
 // Simulate a query that returns no results
 mockQuery('user', {age: 10000});

 store.query('user', {age: 10000}}).then(function(userInstances){
     // userInstances will be empty
   })
 ```

 @param {String} modelName  name of the mode like 'user' for User model type
 @param {String} queryParams  the parameters that will be queried
 @param {Array}  array of Model records to be 'returned' by query
 */
function mockQuery(modelName, queryParams = {}) {
  assert('[ember-data-factory-guy] The second argument ( queryParams ) must be an object', typeOf(queryParams) === 'object');
  return new MockQueryRequest(modelName, queryParams);
}

/**
 Handling ajax GET for finding one record for a type of model with query parameters.


 ```js

 // Create json payload
 let json = FactoryGuy.build('user');

 // Pass in the json in a returns method
 mockQueryRecord('user', {name:'Bob', age: 10}).returns({json});

 store.query('user', {name:'Bob', age: 10}}).then(function(userInstance){
     // userInstance will be created from the json payload
   })
 ```

 ```js

 // Create model instance
 let user = FactoryGuy.make('user');

 // Pass in the array of model instances in the returns method
 mockQueryRecord('user', {name:'Bob', age: 10}).returns({model:user});

 store.query('user', {name:'Bob', age: 10}}).then(function(userInstance){
     // userInstance will be the same of the users that were passed in
   })
 ```

 By not using returns method to return anything, this simulates a
 store.queryRecord request that returns no records

 ```js
 // Simulate a store.queryRecord that returns no results
 mockQueryRecord('user', {age: 10000});

 store.queryRecord('user', {age: 10000}}).then(function(userInstance){
     // userInstance will be empty
   })
 ```

 @param {String} modelName  name of the mode like 'user' for User model type
 @param {String} queryParams  the parameters that will be queried
 @param {Object|Model}  JSON object or Model record to be 'returned' by query
 */
function mockQueryRecord(modelName, queryParams) {
  if (queryParams) {
    assert('The second argument ( queryParams ) must be an object', typeOf(queryParams) === 'object');
  }
  return new MockQueryRecordRequest(modelName, queryParams);
}

/**
 Handling ajax POST ( create record ) for a model.

 ```js
 mockCreate('post')
 mockCreate('post').match({title: 'foo'});
 mockCreate('post').match({title: 'foo', user: user});
 mockCreate('post').returns({createdAt: new Date()});
 mockCreate('post').match({title: 'foo'}).returns({createdAt: new Date()});
 mockCreate('post').match({title: 'foo'}.fails();
 ```

 match - attributes that must be in request json,
 returns - attributes to include in response json,
 fails - can include optional status and response attributes

 ```js
 mockCreate('project').fails({
      status: 422, response: {errors: {name: ['Moo bad, Bahh better']}}
    });
 ```

 Note:
 1) Any attributes in match will be added to the response json automatically,
 so you don't need to include them in the returns hash.

 2) As long as all the match attributes are found in the record being created,
 the create will succeed. In other words, there may be other attributes in the
 createRecord call, but you don't have to match them all. For example:

 ```js
 mockCreate('post').match({title: 'foo'});
 store.createRecord('post', {title: 'foo', created_at: new Date()})
 ```

 2) If you match on a belongsTo association, you don't have to include that in the
 returns hash either.

 @param {String} modelName  name of model you're creating like 'profile' for Profile
 */
function mockCreate(...args) {
  let model, modelName;
  if (args[0] instanceof Model) {
    model = args[0];
    modelName = model.constructor.modelName;
  } else {
    if (typeof args[0] === 'string') {
      [modelName] = args;
    }
  }
  assert(`[ember-data-factory-guy] To mockUpdate pass in a model instance or a modelName`, modelName);
  return new MockCreateRequest(modelName, {
    model
  });
}

/**
 Handling ajax PUT ( update record ) for a model type. You can mock
 failed update by calling 'fails' method after setting up the mock

 ```js
 // Typically you will make a model
 let user = make('user');
 // and then to handle update, use the mockUpdate call to mock a update
 mockUpdate(user);
 or
 // mockUpdate('user', user.id);
 or
 // just the model type
 // mockUpdate('user');

 // and to mock failure case use method fails
 mockUpdate(user).fails();
 ```

 @param {String} type  model type like 'user' for User model, or a model instance
 @param {String} id  id of record to update
 @param {Object} options options object
 */
function mockUpdate(...args) {
  let model, modelName, id;
  if (args[0] instanceof Model) {
    model = args[0];
    id = model.id;
    modelName = model.constructor.modelName;
  } else {
    if (typeof args[0] === 'string') {
      [modelName, id] = args;
    }
  }
  assert('[ember-data-factory-guy] To mockUpdate pass in a model instance or a modelName and an id or just a modelName', modelName);
  return new MockUpdateRequest(modelName, {
    id,
    model
  });
}

/**
 Handling ajax DELETE ( delete record ) for a model type. You can mock
 failed delete by calling 'fails' method after setting up the mock

 @param {String|Model} type|model model type like 'user' for User model or Model record
 @param {String} id optional id of record to delete
 */
function mockDelete(...args) {
  let model, modelName, id;
  if (args[0] instanceof Model) {
    model = args[0];
    id = model.id;
    modelName = model.constructor.modelName;
  } else if (typeof args[0] === 'string') {
    [modelName, id] = args;
  }
  assert(`[ember-data-factory-guy] mockDelete requires at least a model type name`, modelName);
  return new MockDeleteRequest(modelName, {
    id,
    model
  });
}

/**
 Returns the Pretender instance used for the mocks.
 */
function getPretender() {
  return RequestManager.getPretender();
}

class scenario {
  constructor() {
    this.make = make;
    this.makeNew = makeNew;
    this.makeList = makeList;
    this.build = build;
    this.buildList = buildList;
    this.attributesFor = attributesFor;
    this.mockFindRecord = mockFindRecord;
    this.mockFindAll = mockFindAll;
    this.mockReload = mockReload;
    this.mockQuery = mockQuery;
    this.mockQueryRecord = mockQueryRecord;
    this.mockUpdate = mockUpdate;
    this.mockCreate = mockCreate;
    this.mockDelete = mockDelete;
    this.mock = mock;
    this.store = factoryGuy.store;
  }
  static settings(opts = {}) {
    factoryGuy.settings(opts);
  }
  run() {}
  include(scenarios) {
    (scenarios || []).forEach(Scenario => new Scenario().run());
  }
}

/**
 * Setup and teardown code, intended to be called with qunit hooks so that it can run code before & after each test.
 */
function setupFactoryGuy(hooks) {
  hooks.beforeEach(function () {
    const {
      owner
    } = getContext();
    factoryGuy.setStore(owner.lookup('service:store'));
  });
  hooks.afterEach(function () {
    factoryGuy.reset();
  });
}

export { scenario as Scenario, attributesFor, build, buildList, factoryGuy as default, getPretender, make, makeList, makeNew, mock, mockCreate, mockDelete, mockFindAll, mockFindRecord, mockLinks, mockQuery, mockQueryRecord, mockReload, mockUpdate, setupFactoryGuy };
//# sourceMappingURL=index.js.map
