import Store from '@ember-data/store';
import { assert } from '@ember/debug';
import { typeOf, isEmpty, isPresent } from '@ember/utils';
import { join } from '@ember/runloop';
import { A } from '@ember/array';
import JSONSerializer from '@ember-data/serializer/json';
import RESTSerializer from '@ember-data/serializer/rest';
import JSONAPISerializer from '@ember-data/serializer/json-api';
import { camelize, dasherize, w, underscore } from '@ember/string';
import { getOwner } from '@ember/application';
import { macroCondition, dependencySatisfies, importSync } from '@embroider/macros';
import { pluralize } from 'ember-inflector';
import Pretender from 'pretender';

const plusRegex = new RegExp('\\+', 'g');
function paramsFromRequestBody(body) {
  let params = {};
  if (typeof body === 'string') {
    if (body.match(/=/)) {
      body = decodeURIComponent(body).replace(plusRegex, ' ');
      (body.split('&') || []).map(param => {
        const [key, value] = param.split('=');
        params[key] = value;
      });
    } else if (body.match(/:/)) {
      params = JSON.parse(body);
    }
    return params;
  }
  return body;
}
function toParams(obj) {
  return parseParms(decodeURIComponent(param(obj)));
}

/**
 * Iterator for object key, values
 *
 * @public
 * @param obj
 */
function* entries(obj) {
  for (let key of Object.keys(obj)) {
    yield [key, obj[key]];
  }
}
function param(obj, prefix) {
  let str = [],
    p;
  for (p in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, p)) {
      var k = prefix ? prefix + '[' + p + ']' : p,
        v = obj[p];
      str.push(v !== null && typeof v === 'object' ? param(v, k) : encodeURIComponent(k) + '=' + encodeURIComponent(v));
    }
  }
  return str.join('&');
}
function parseParms(str) {
  let pieces = str.split('&'),
    data = {},
    i,
    parts,
    key,
    value;

  // Process each query pair
  for (i = 0; i < pieces.length; i++) {
    parts = pieces[i].split('=');

    // No value, only key
    if (parts.length < 2) {
      parts.push('');
    }
    key = decodeURIComponent(parts[0]);
    value = decodeURIComponent(parts[1]);

    // Key is an array
    if (key.indexOf('[]') !== -1) {
      key = key.substring(0, key.indexOf('[]'));

      // Check already there
      if ('undefined' === typeof data[key]) {
        data[key] = [];
      }
      data[key].push(value);
    } else {
      data[key] = value;
    }
  }
  return data;
}
function isEmptyObject(obj) {
  return !isObject(obj) || Object.keys(obj).length === 0;
}

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (isObject(source[key])) {
          if (!target[key]) {
            Object.assign(target, {
              [key]: {}
            });
          }
          mergeDeep(target[key], source[key]);
        } else {
          Object.assign(target, {
            [key]: source[key]
          });
        }
      }
    }
  }
  return mergeDeep(target, ...sources);
}
function isEquivalent(a, b) {
  var type = typeOf(a);
  if (type !== typeOf(b)) {
    return false;
  }
  switch (type) {
    case 'object':
      return objectIsEquivalent(a, b);
    case 'array':
      return arrayIsEquivalent(a, b);
    default:
      return a === b;
  }
}
function isPartOf(object, part) {
  return Object.keys(part).every(function (key) {
    return isEquivalent(object[key], part[key]);
  });
}
function arrayIsEquivalent(arrayA, arrayB) {
  if (arrayA.length !== arrayB.length) {
    return false;
  }
  return arrayA.every(function (item, index) {
    return isEquivalent(item, arrayB[index]);
  });
}
function objectIsEquivalent(objectA, objectB) {
  let aProps = Object.keys(objectA),
    bProps = Object.keys(objectB);
  if (aProps.length !== bProps.length) {
    return false;
  }
  for (let i = 0; i < aProps.length; i++) {
    let propName = aProps[i],
      aEntry = objectA[propName],
      bEntry = objectB[propName];
    if (!isEquivalent(aEntry, bEntry)) {
      return false;
    }
  }
  return true;
}

/**
 * Used to split a url with query parms into url and queryParams
 * MockLinks and Mock both use this
 *
 * @param url
 * @returns {*[]}
 */
function parseUrl(url) {
  const [urlPart, query] = (url || '').split('?');
  const params = query && query.split('&').reduce((params, param) => {
    let [key, value] = param.split('=');
    params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
    return params;
  }, {}) || {};
  return [urlPart, params];
}

let Fragment$1;
let FragmentArray;
if (macroCondition(dependencySatisfies('ember-data-model-fragments', '*'))) {
  Fragment$1 = importSync('ember-data-model-fragments/fragment').default;
  FragmentArray = importSync('ember-data-model-fragments/array/fragment').default;
}

/**
 Base class for converting the base fixture that factory guy creates to
 the payload expected by ember data adapter.

 While it's converting the format, it transforms the attribute and relationship keys.
 Don't want to transform keys when building payload for a FactoryGuy#make/makeList operation,
 but only for build/buildList.

 serializerMode (true) means => produce json as if ember data was serializing the payload
 to go back to the server.
 So, what does serializerMode ( false ) mean? produce json that can immediately be consumed
 by ember data .. but it is such a long story .. that I will have to explain another time

 If there are associations in the base fixture, they will be added to the
 new fixture as 'side loaded' elements, even if they are another json payload
 built with the build/buildList methods.

 @param {DS.Store} store
 @param {Object} options
 transformKeys transform keys and values in fixture if true
 serializeMode act like serialization is for a return to server if true
 @constructor
 */
class FixtureConverter {
  constructor(store, {
    transformKeys = true,
    serializeMode = false
  } = {}) {
    this.transformKeys = transformKeys;
    this.serializeMode = serializeMode;
    this.store = store;
    this.listType = false;
    this.noTransformFn = x => x;
    this.defaultValueTransformFn = this.noTransformFn;
  }

  /**
   Convert an initial fixture into a final payload.
   This raw fixture can contain other json in relationships that were
   built by FactoryGuy ( build, buildList ) methods
    @param modelName
   @param fixture
   @returns {*} converted fixture
   */
  convert(modelName, fixture) {
    let data;
    if (typeOf(fixture) === 'array') {
      this.listType = true;
      data = fixture.map(single => {
        return this.convertSingle(modelName, single);
      });
    } else {
      data = this.convertSingle(modelName, fixture);
    }
    let payload = this.createPayload(modelName, data);
    this.addIncludedArray(payload);
    return payload;
  }

  /**
   Empty response is a special case, so use this method for generating it.
    @param _
   @param {Object} options useValue to override the null value that is passed
   @returns {Array|null}
   */
  emptyResponse(_, options = {}) {
    return options.useValue || null;
  }

  /**
   * Use the primaryKey from the serializer if it is declared
   *
   * @param modelName
   * @param data
   * @param fixture
   */
  addPrimaryKey(modelName, data, fixture) {
    let primaryKey = this.store.serializerFor(modelName).get('primaryKey'),
      primaryKeyValue = fixture[primaryKey] || fixture.id;
    // model fragments will have no primaryKey and don't want them to have id
    if (primaryKeyValue) {
      // need to set the id for all as a baseline
      data.id = primaryKeyValue;
      // if the id is NOT the primary key, need to make sure that the primaryKey
      // has the primaryKey value
      data[primaryKey] = primaryKeyValue;
    }
  }
  transformRelationshipKey(relationship) {
    let {
        parentModelName,
        parentType
      } = relationship,
      type = parentModelName || parentType && parentType.modelName || relationship.type,
      transformFn = this.getTransformKeyFunction(type, 'Relationship');
    return transformFn(relationship.name, relationship.kind);
  }
  getRelationshipType(relationship, fixture) {
    let isPolymorphic = relationship.options.polymorphic;
    return isPolymorphic ? this.polymorphicTypeTransformFn(fixture.type) : relationship.type;
  }
  attributeIncluded(attribute, modelName) {
    if (!this.serializeMode) {
      return true;
    }
    let serializer = this.store.serializerFor(modelName),
      attrOptions = this.attrsOption(serializer, attribute);
    if (attrOptions && attrOptions.serialize === false) {
      return false;
    }
    return true;
  }
  getTransformKeyFunction(modelName, type) {
    if (!this.transformKeys) {
      return this.noTransformFn;
    }
    let serializer = this.store.serializerFor(modelName),
      keyFn = serializer['keyFor' + type] || this.defaultKeyTransformFn;
    return (attribute, method) => {
      // if there is an attrs override in serializer, return that first
      let attrOptions = this.attrsOption(serializer, attribute),
        attrName;
      if (attrOptions) {
        if (attrOptions.key) {
          attrName = attrOptions.key;
        }
        if (typeOf(attrOptions) === 'string') {
          attrName = attrOptions;
        }
      }
      return attrName || keyFn.apply(serializer, [attribute, method, 'serialize']);
    };
  }
  getTransformValueFunction(type) {
    if (!this.transformKeys || type && type.match('-mf')) {
      return this.noTransformFn;
    }
    if (!type) {
      return this.defaultValueTransformFn;
    }
    let container = getOwner(this.store),
      transform = container.lookup('transform:' + type);
    assert(`[ember-data-factory-guy] could not find
    the [ ${type} ] transform. If you are in a unit test, be sure
    to include it in the list of needs as [ transform:${type} ],  Or set your
    unit test to be [ integration: true ] and include everything.`, transform);
    let transformer = container.lookup('transform:' + type);
    return transformer.serialize.bind(transformer);
  }
  extractAttributes(modelName, fixture) {
    let attributes = {},
      transformKeyFunction = this.getTransformKeyFunction(modelName, 'Attribute');
    this.store.modelFor(modelName).eachAttribute((attribute, meta) => {
      if (this.attributeIncluded(attribute, modelName)) {
        let attributeKey = transformKeyFunction(attribute),
          transformValueFunction = this.getTransformValueFunction(meta.type);
        let attributeValueInFixture = fixture[attributeKey];

        // If passed Fragments or FragmentArrays we must transform them to their serialized form before we can push them into the Store
        if (Fragment$1 && attributeValueInFixture instanceof Fragment$1 || FragmentArray && attributeValueInFixture instanceof FragmentArray) {
          fixture[attributeKey] = this.normalizeModelFragments(attributeValueInFixture);
        }
        if (Object.prototype.hasOwnProperty.call(fixture, attribute)) {
          attributes[attributeKey] = transformValueFunction(fixture[attribute], meta.options);
        } else if (Object.prototype.hasOwnProperty.call(fixture, attributeKey)) {
          attributes[attributeKey] = transformValueFunction(fixture[attributeKey], meta.options);
        }
      }
    });
    return attributes;
  }
  normalizeModelFragments(attributeValueInFixture) {
    if (Fragment$1 && attributeValueInFixture instanceof Fragment$1) {
      return this.store.normalize(attributeValueInFixture.constructor.modelName, attributeValueInFixture.serialize()).data.attributes;
    }
    if (FragmentArray && attributeValueInFixture instanceof FragmentArray) {
      return attributeValueInFixture.serialize().map(item => this.store.normalize(attributeValueInFixture.type, item).data.attributes);
    }
  }

  /**
   Extract relationships and descend into those looking for others
    @param {String} modelName
   @param {Object} fixture
   @returns {{}}
   */
  extractRelationships(modelName, fixture) {
    let relationships = {};
    this.store.modelFor(modelName).eachRelationship((key, relationship) => {
      if (Object.prototype.hasOwnProperty.call(fixture, key)) {
        if (relationship.kind === 'belongsTo') {
          this.extractBelongsTo(fixture, relationship, modelName, relationships);
        } else if (relationship.kind === 'hasMany') {
          this.extractHasMany(fixture, relationship, modelName, relationships);
        }
      }
    });
    return relationships;
  }

  /**
   Extract belongTo relationships
    @param fixture
   @param relationship
   @param relationships
   */
  extractBelongsTo(fixture, relationship, parentModelName, relationships) {
    let belongsToRecord = fixture[relationship.name],
      isEmbedded = this.isEmbeddedRelationship(parentModelName, relationship.name),
      relationshipKey = isEmbedded ? relationship.name : this.transformRelationshipKey(relationship);
    let data = this.extractSingleRecord(belongsToRecord, relationship, isEmbedded);
    relationships[relationshipKey] = this.assignRelationship(data);
  }

  // Borrowed from ember data
  // checks config for attrs option to embedded (always)
  isEmbeddedRelationship(modelName, attr) {
    let serializer = this.store.serializerFor(modelName),
      option = this.attrsOption(serializer, attr);
    return option && (option.embedded === 'always' || option.deserialize === 'records');
  }
  attrsOption(serializer, attr) {
    let attrs = serializer.get('attrs'),
      option = attrs && (attrs[camelize(attr)] || attrs[attr]);
    return option;
  }
  extractHasMany(fixture, relationship, parentModelName, relationships) {
    let hasManyRecords = fixture[relationship.name],
      relationshipKey = this.transformRelationshipKey(relationship),
      isEmbedded = this.isEmbeddedRelationship(parentModelName, relationship.name);
    if (hasManyRecords && hasManyRecords.isProxy) {
      return this.addListProxyData(hasManyRecords, relationship, relationships, isEmbedded);
    }
    if (typeOf(hasManyRecords) !== 'array') {
      return;
    }
    let records = hasManyRecords.map(hasManyRecord => {
      return this.extractSingleRecord(hasManyRecord, relationship, isEmbedded);
    });
    relationships[relationshipKey] = this.assignRelationship(records);
  }
  extractSingleRecord(record, relationship, isEmbedded) {
    let data;
    switch (typeOf(record)) {
      case 'object':
        if (record.isProxy) {
          data = this.addProxyData(record, relationship, isEmbedded);
        } else {
          data = this.addData(record, relationship, isEmbedded);
        }
        break;
      case 'instance':
        data = this.normalizeAssociation(record, relationship);
        break;
      case 'number':
      case 'string':
        assert(`Polymorphic relationships cannot be specified by id you
          need to supply an object with id and type`, !relationship.options.polymorphic);
        record = {
          id: record,
          type: relationship.type
        };
        data = this.normalizeAssociation(record, relationship);
    }
    return data;
  }
  assignRelationship(object) {
    return object;
  }

  /**
   * Technically don't have to verify the links because hey would not even be assigned,
   * but the user might want to know why
   *
   * @param modelName
   * @param links
   */
  verifyLinks(modelName, links = {}) {
    const modelClass = this.store.modelFor(modelName),
      relationships = modelClass.relationshipsByName;
    for (let [relationshipKey, link] of entries(links)) {
      assert(`You defined a link url ${link} for the [${relationshipKey}] relationship
        on model [${modelName}] but that relationship does not exist`, relationships.get(relationshipKey));
    }
  }
  addData(embeddedFixture, relationship, isEmbedded) {
    let relationshipType = this.getRelationshipType(relationship, embeddedFixture),
      // find possibly more embedded fixtures
      data = this.convertSingle(relationshipType, embeddedFixture);
    if (isEmbedded) {
      return data;
    }
    this.addToIncluded(data, relationshipType);
    return this.normalizeAssociation(data, relationship);
  }

  // proxy data is data that was build with FactoryGuy.build method
  addProxyData(jsonProxy, relationship, isEmbedded) {
    let data = jsonProxy.getModelPayload(),
      relationshipType = this.getRelationshipType(relationship, data);
    if (isEmbedded) {
      this.addToIncludedFromProxy(jsonProxy);
      return data;
    }
    this.addToIncluded(data, relationshipType);
    this.addToIncludedFromProxy(jsonProxy);
    return this.normalizeAssociation(data, relationship);
  }

  // listProxy data is data that was build with FactoryGuy.buildList method
  addListProxyData(jsonProxy, relationship, relationships, isEmbedded) {
    let relationshipKey = this.transformRelationshipKey(relationship);
    let records = jsonProxy.getModelPayload().map(data => {
      if (isEmbedded) {
        return data;
      }
      let relationshipType = this.getRelationshipType(relationship, data);
      this.addToIncluded(data, relationshipType);
      return this.normalizeAssociation(data, relationship);
    });
    this.addToIncludedFromProxy(jsonProxy);
    relationships[relationshipKey] = this.assignRelationship(records);
  }
}

/**
 * Using `serializeMode` to create a payload the way ember-data would serialize types
 * when returning a payload to a server that accepts JSON-API wherin the types are
 * pluralized
 *
 */
class JSONAPIFixtureConverter extends FixtureConverter {
  constructor(store, {
    transformKeys = true,
    serializeMode = false
  } = {}) {
    super(store, {
      transformKeys,
      serializeMode
    });
    this.typeTransformFn = this.serializeMode ? this.typeTransformViaSerializer : dasherize;
    this.defaultKeyTransformFn = dasherize;
    this.polymorphicTypeTransformFn = dasherize;
    this.included = [];
  }
  typeTransformViaSerializer(modelName) {
    let serializer = this.store.serializerFor(modelName);
    return serializer.payloadKeyFromModelName(modelName);
  }
  emptyResponse(_, options = {}) {
    return {
      data: options.useValue || null
    };
  }

  /**
   * JSONAPISerializer does not use modelName for payload key,
   * and just has 'data' as the top level key.
   *
   * @param modelName
   * @param fixture
   * @returns {*}
   */
  createPayload(modelName, fixture) {
    return {
      data: fixture
    };
  }

  /**
   * Add the included data
   *
   * @param payload
   */
  addIncludedArray(payload) {
    if (!isEmpty(this.included)) {
      payload.included = this.included;
    }
  }

  /**
   In order to conform to the way ember data expects to handle relationships
   in a json api payload ( during deserialization ), convert a record ( model instance )
   into an object with type and id. Types are pluralized.
    @param {Object or DS.Model instance} record
   @param {Object} relationship
   */
  normalizeAssociation(record) {
    if (typeOf(record) === 'object') {
      return {
        type: this.typeTransformFn(record.type),
        id: record.id
      };
    } else {
      return {
        type: this.typeTransformFn(record.constructor.modelName),
        id: record.id
      };
    }
  }
  isEmbeddedRelationship(/*modelName, attr*/
  ) {
    return false;
  }

  /**
   Recursively descend into the fixture json, looking for relationships that are
   either record instances or other fixture objects that need to be normalized
   and/or included in the 'included' hash
    @param modelName
   @param fixture
   @param included
   @returns {{type: *, id: *, attributes}}
   */
  convertSingle(modelName, fixture) {
    let polymorphicType = fixture.type;
    if (polymorphicType && fixture._notPolymorphic) {
      polymorphicType = modelName;
      delete fixture._notPolymorphic;
    }
    let data = {
      type: this.typeTransformFn(polymorphicType || modelName),
      attributes: this.extractAttributes(modelName, fixture)
    };
    this.addPrimaryKey(modelName, data, fixture);
    let relationships = this.extractRelationships(modelName, fixture);
    this.verifyLinks(modelName, fixture.links);
    this.assignLinks(relationships, fixture.links);
    if (Object.getOwnPropertyNames(relationships).length > 0) {
      data.relationships = relationships;
    }
    return data;
  }

  /*
   Add the model to included array unless it's already there.
   */
  addToIncluded(data) {
    let found = A(this.included).find(model => {
      return model.id === data.id && model.type === data.type;
    });
    if (!found) {
      this.included.push(data);
    }
  }
  addToIncludedFromProxy(proxy) {
    proxy.includes().forEach(data => {
      this.addToIncluded(data);
    });
  }
  assignRelationship(object) {
    return {
      data: object
    };
  }

  /**
   * JSONAPI can have data and links in the same relationship definition
   * so do special handling to make it happen
   *
   *  json = build('user', {links: {company: '/user/1/company'}});
   *
   *  {
   *    data: {
   *      id: 1,
   *      type: 'user',
   *      attributes: {
   *        name: 'User1',
   *        style: "normal"
   *      },
   *      relationships: {
   *        company: {
   *          links: {related: '/user/1/company'}
   *        }
   *      }
   *    }
   *
   * @param relationshipData
   * @param links
   */
  assignLinks(relationshipData, links) {
    for (let [relationshipKey, link] of entries(links || {})) {
      let data = relationshipData[relationshipKey];
      data = Object.assign({
        links: {
          related: link
        }
      }, data);
      relationshipData[relationshipKey] = data;
    }
  }
}

class RESTFixtureBuilder$1 {
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
    let converter = this.getConverter(),
      model = this.store.modelFor(modelName),
      relationshipsByName = model.relationshipsByName,
      relationship = relationshipsByName.get(key);
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
    let converter = new JSONAPIFixtureConverter(this.store, {
      transformKeys: false
    });
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
    let jsonAPIErrors = [],
      {
        errors
      } = object;
    assert(`[ember-data-factory-guy] Your error response must have an errors key. 
      The errors hash format is: {errors: {name: ["name too short"]}}`, errors);
    for (let key in errors) {
      let description = typeOf(errors[key]) === 'array' ? errors[key][0] : errors[key],
        source = {
          pointer: 'data/attributes/' + key
        },
        newError = {
          detail: description,
          title: 'invalid ' + key,
          source: source
        };
      jsonAPIErrors.push(newError);
    }
    return {
      errors: jsonAPIErrors
    };
  }
}

class BasePayload {
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
    this.proxyMethods = w('getModelPayload isProxy get add unwrap');
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
    A(Object.getOwnPropertyNames(more)).reject(key => A(this.proxyMethods).includes(key)).forEach(key => {
      if (typeOf(more[key]) === 'array') {
        more[key].forEach(data => this.converter.addToIncluded(data, key));
      } else {
        if (key === 'meta') {
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
    Object.assign(this.json.meta, data);
  }

  // marker function for saying "I am a proxy"
  isProxy() {}

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

class JSONAPIPayload extends BasePayload {
  constructor(modelName, json, converter) {
    super(modelName, json, converter);
    this.data = json.data;
    this.addProxyMethods(['includes']);
  }
  getModelPayload() {
    return this.data;
  }

  /**
   * Override base add method for special json-api handling to
   * add more things to payload like meta or more json to sideload
   *
   * @param more
   */
  add(more) {
    if (more.meta) {
      this.addMeta(more.meta);
    } else {
      if (!this.json.included) {
        this.json.included = [];
      }
      this.converter.included = this.json.included;
      // add the main moreJson model payload
      let data = more.getModelPayload();
      if (typeOf(data) === 'array') {
        data.forEach(dati => this.converter.addToIncluded(dati));
      } else {
        this.converter.addToIncluded(data);
      }
      // add all of the moreJson's includes
      this.converter.addToIncludedFromProxy(more);
    }
    return this.json;
  }
  createAttrs(data) {
    let relationships = {};
    Object.keys(data.relationships || []).forEach(key => {
      relationships[key] = data.relationships[key].data;
    });
    let attrs = Object.assign({}, data.attributes, relationships);
    attrs.id = data.id;
    return attrs;
  }
  includes() {
    return this.json.included || [];
  }
  getObjectKeys(key) {
    let attrs = this.createAttrs(this.data);
    if (!key) {
      return attrs;
    }
    if (attrs[key]) {
      return attrs[key];
    }
  }
  getListKeys(key) {
    let attrs = this.data.map(data => this.createAttrs(data));
    if (isEmpty(key)) {
      return attrs;
    }
    if (typeof key === 'number') {
      return attrs[key];
    }
    if (key === 'firstObject') {
      return attrs[0];
    }
    if (key === 'lastObject') {
      return attrs[attrs.length - 1];
    }
  }
}

/**
 Fixture Builder for JSONAPISerializer
 */
class JSONAPIFixtureBuilder extends RESTFixtureBuilder$1 {
  constructor(store) {
    super(store, JSONAPIFixtureConverter, JSONAPIPayload);
    this.updateHTTPMethod = 'PATCH';
  }
}

/**
 Convert base fixture to a JSON format payload.

 @param store
 @constructor
 */
class JSONFixtureConverter extends FixtureConverter {
  constructor(store, options) {
    super(store, options);
    this.defaultKeyTransformFn = underscore;
    this.polymorphicTypeTransformFn = underscore;
  }

  /**
   * Can't add to payload since sideloading not supported
   *
   * @param moreJson
   */
  add(/*moreJson*/) {}

  /**
   * There is no payload key for JSON Serializer
   *
   * @param modelName
   * @param fixture
   * @returns {*}
   */
  createPayload(_, fixture) {
    return fixture;
  }

  /**
   * There is no sideloading for JSON Serializer
   *
   * @param payload
   */
  addIncludedArray(/*payload*/) {}

  /**
   Convert single record
    @param {String} modelName
   @param {Object} fixture
   */
  convertSingle(modelName, fixture) {
    let data = {},
      attributes = this.extractAttributes(modelName, fixture),
      relationships = this.extractRelationships(modelName, fixture);
    Object.keys(attributes).forEach(key => {
      data[key] = attributes[key];
    });
    Object.keys(relationships).forEach(key => {
      data[key] = relationships[key];
    });
    this.addPrimaryKey(modelName, data, fixture);
    this.verifyLinks(modelName, fixture.links);
    this.assignLinks(data, fixture.links);
    return data;
  }
  transformRelationshipKey(relationship) {
    let transformedKey = super.transformRelationshipKey(relationship);
    if (relationship.options.polymorphic) {
      transformedKey = transformedKey.replace('_id', '');
    }
    return transformedKey;
  }

  /**
    @param {Object} record
   @param {Object} relationship
   */
  normalizeAssociation(record, relationship) {
    if (this.serializeMode) {
      return record.id;
    }
    if (typeOf(record) === 'object') {
      if (relationship.options.polymorphic) {
        return {
          type: dasherize(record.type),
          id: record.id
        };
      } else {
        return record.id;
      }
    }
    // it's a model instance
    if (relationship.options.polymorphic) {
      return {
        type: dasherize(record.constructor.modelName),
        id: record.id
      };
    }
    return record.id;
  }

  /**
   * JSON/REST links can be placed in the data exactly as they appear
   * on the fixture definition
   *
   *   json = build('user', {links: {properties: '/user/1/properties'}});
   *
   *    {
   *      user: {
   *        id: 1,
   *        name: 'User1',
   *        style: "normal",
   *        links: { properties: '/user/1/properties' }
   *      }
   *    }
   *
   * @param data
   * @param links
   */
  assignLinks(data, links) {
    if (!isEmptyObject(links)) {
      data.links = links;
    }
  }

  /**
   The JSONSerializer does not support sideloading records
    @param {String} modelKey
   @param {Object} data
   @param {Object} includeObject
   */
  addToIncluded(/*data, modelKey*/) {}

  /**
   The JSONSerializer does not support sideloading records
    @param proxy json payload proxy
   */
  addToIncludedFromProxy(/*proxy*/) {}
}

/**
 Convert base fixture to a REST Serializer formatted payload.

 @param store
 @constructor
 */
class RESTFixtureConverter extends JSONFixtureConverter {
  constructor(store, options) {
    super(store, options);
    this.included = {};
  }
  emptyResponse(modelName, options = {}) {
    return {
      [modelName]: options.useValue || null
    };
  }

  /**
   * RESTSerializer has a payload key
   *
   * @param modelName
   * @param fixture
   * @returns {*}
   */
  createPayload(modelName, fixture) {
    return {
      [this.getPayloadKey(modelName)]: fixture
    };
  }

  /**
   * Get the payload key for this model from the serializer
   *
   * @param modelName
   * @returns {*}
   */
  getPayloadKey(modelName) {
    let serializer = this.store.serializerFor(modelName),
      payloadKey = modelName;
    // model fragment serializer does not have payloadKeyFromModelName method
    if (serializer.payloadKeyFromModelName) {
      payloadKey = serializer.payloadKeyFromModelName(modelName);
    }
    return this.listType ? pluralize(payloadKey) : payloadKey;
  }

  /**
   * Add the included data to the final payload
   *
   * @param payload
   */
  addIncludedArray(payload) {
    Object.keys(this.included).forEach(key => {
      if (!payload[key]) {
        payload[key] = this.included[key];
      } else {
        Array.prototype.push.apply(payload[key], this.included[key]);
      }
    });
  }

  /**
   Add the model to included array unless it's already there.
    @param {String} modelKey
   @param {Object} data
   @param {Object} includeObject
   */
  addToIncluded(data, modelKey) {
    let relationshipKey = pluralize(dasherize(modelKey));
    if (!this.included[relationshipKey]) {
      this.included[relationshipKey] = [];
    }
    let modelRelationships = this.included[relationshipKey],
      found = A(modelRelationships).find(existing => existing.id === data.id);
    if (!found) {
      modelRelationships.push(data);
    }
  }

  /**
   Add proxied json to this payload, by taking all included models and
   adding them to this payloads includes
    @param proxy json payload proxy
   */
  addToIncludedFromProxy(proxy) {
    proxy.includeKeys().forEach(modelKey => {
      let includedModels = proxy.getInclude(modelKey);
      includedModels.forEach(data => {
        this.addToIncluded(data, modelKey);
      });
    });
  }
}

class RESTPayload extends BasePayload {
  constructor(modelName, json, converter) {
    super(modelName, json, converter);
    this.payloadKey = converter.getPayloadKey(modelName);
    this.addProxyMethods(['includeKeys', 'getInclude']);
  }
  includeKeys() {
    let keys = A(Object.keys(this.json)).reject(key => this.payloadKey === key);
    return A(keys).reject(key => A(this.proxyMethods).includes(key)) || [];
  }
  getInclude(modelType) {
    return this.json[modelType];
  }
  getObjectKeys(key) {
    let attrs = this.json[this.payloadKey];
    if (isEmpty(key)) {
      return attrs;
    }
    return attrs[key];
  }
  getListKeys(key) {
    let attrs = this.json[this.payloadKey];
    if (isEmpty(key)) {
      return attrs;
    }
    if (typeof key === 'number') {
      return attrs[key];
    }
    if (key === 'firstObject') {
      return attrs[0];
    }
    if (key === 'lastObject') {
      return attrs[attrs.length - 1];
    }
  }
}

/**
 Fixture Builder for REST based Serializer, like ActiveModelSerializer or
 RESTSerializer

 */
class RESTFixtureBuilder extends RESTFixtureBuilder$1 {
  constructor(store) {
    super(store, RESTFixtureConverter, RESTPayload);
  }
  /**
   Map single object to response json.
    Allows custom serializing mappings and meta data to be added to requests.
    @param {String} modelName model name
   @param {Object} json Json object from record.toJSON
   @return {Object} responseJson
   */
  normalize(modelName, payload) {
    return {
      [modelName]: payload
    };
  }
}

class JSONPayload extends BasePayload {
  /** 
   Can't add to included array for JSON payloads since they have
   no includes or sideloaded relationships
    Meta not working at the moment for this serializer even though
   it is being included here in the payload
   */
  add(more) {
    if (more.meta) {
      this.addMeta(more.meta);
    }
    return this.json;
  }
  getObjectKeys(key) {
    let attrs = this.json;
    if (isEmpty(key)) {
      return JSON.parse(JSON.stringify(attrs));
    }
    return attrs[key];
  }
  getListKeys(key) {
    let attrs = this.json;
    if (isEmpty(key)) {
      return JSON.parse(JSON.stringify(attrs));
    }
    if (typeof key === 'number') {
      return attrs[key];
    }
    if (key === 'firstObject') {
      return attrs[0];
    }
    if (key === 'lastObject') {
      return attrs[attrs.length - 1];
    }
  }
}

/**
 Fixture Builder for JSONSerializer

 */
class JSONFixtureBuilder extends RESTFixtureBuilder$1 {
  constructor(store) {
    super(store, JSONFixtureConverter, JSONPayload);
  }
  /**
   Map single object to response json.
    Allows custom serializing mappings and meta data to be added to requests.
    @param {String} modelName model name
   @param {Object} json Json object from record.toJSON
   @return {Object} responseJson
   */
  normalize(_, payload) {
    return payload;
  }
}

/**
 Convert base fixture to the ActiveModel Serializer expected payload.
 */
class AMSFixtureConverter extends RESTFixtureConverter {
  /**
   * In `serializeMode` use convert a relationship from "company" to "company_id"
   * which REST / JSON converters override to strip that _id
   *
   * @param relationship
   * @returns {*}
   */
  transformRelationshipKey(relationship) {
    if (this.serializeMode) {
      let transformFn = this.getTransformKeyFunction(relationship.type, 'Relationship');
      return transformFn(relationship.name, relationship.kind);
    } else {
      return super.transformRelationshipKey(relationship);
    }
  }
}

/**
 Fixture Builder for ActiveModelSerializer
 */
class ActiveModelFixtureBuilder extends RESTFixtureBuilder$1 {
  constructor(store) {
    super(store, AMSFixtureConverter, RESTPayload);
  }

  /**
   ActiveModelAdapter converts them automatically for status 422
    @param errors
   @returns {*}
   */
  convertResponseErrors(errors, status) {
    if (status === 422) {
      return errors;
    } else {
      return super.convertResponseErrors(errors, status);
    }
  }

  /**
   Map single object to response json.
    Allows custom serializing mappings and meta data to be added to requests.
    @param {String} modelName model name
   @param {Object} json Json object from record.toJSON
   @return {Object} responseJson
   */
  normalize(modelName, payload) {
    return {
      [modelName]: payload
    };
  }
}

let ActiveModelSerializer;
if (macroCondition(dependencySatisfies('active-model-adapter', '*'))) {
  ActiveModelSerializer = importSync('active-model-adapter').ActiveModelSerializer;
}
class FixtureBuilderFactory {
  constructor(store) {
    this.store = store;
  }

  /**
   Return appropriate FixtureBuilder for the model's serializer type
   */
  fixtureBuilder(modelName) {
    let serializer = this.store.serializerFor(modelName);
    if (!serializer) {
      return new JSONAPIFixtureBuilder(this.store);
    }
    if (this.usingJSONAPISerializer(serializer)) {
      return new JSONAPIFixtureBuilder(this.store);
    }
    if (this.usingActiveModelSerializer(serializer)) {
      return new ActiveModelFixtureBuilder(this.store);
    }
    if (this.usingRESTSerializer(serializer)) {
      return new RESTFixtureBuilder(this.store);
    }
    if (this.usingJSONSerializer(serializer)) {
      return new JSONFixtureBuilder(this.store);
    }
    return new JSONAPIFixtureBuilder(this.store);
  }
  usingJSONAPISerializer(serializer) {
    return serializer instanceof JSONAPISerializer;
  }
  usingActiveModelSerializer(serializer) {
    return ActiveModelSerializer && serializer instanceof ActiveModelSerializer;
  }
  usingRESTSerializer(serializer) {
    return serializer instanceof RESTSerializer;
  }
  usingJSONSerializer(serializer) {
    return serializer instanceof JSONSerializer;
  }
}

/**
 * This request wrapper controls what will be returned by one url / http verb
 * Normally when you set up pretender, you give it one function to handle one url / verb.
 *
 * So, for example, you would:
 *
 *  ```
 *    pretender.get('/users', myfunction )
 *  ```
 *
 *  to mock a [GET /users] call
 *
 *  This wrapper allows that GET /users call to be handled my many functions
 *  instead of just one, since this request handler hold the ability to take
 *  a list of hanlders.
 *
 *  That way you can setup a few mocks like
 *
 *  ```
 *    mockFindAll('user')
 *    mockQuery('user', {name: 'Dude'})
 *  ```
 *
 *  and both of these hanlders will reside in the list for the wrapper that
 *  belongs to [GET /users]
 */
class RequestWrapper {
  constructor() {
    this.index = 0;
    this.handlers = [];
    return this.generateRequestHandler();
  }

  /**
   * Generating a function that we can hand off to pretender that
   * will handle the request.
   *
   * Before passing back that function, add some other functions
   * to control the handlers array
   *
   * @returns {function(this:T)}
   */
  generateRequestHandler() {
    let requestHandler = this.handleRequest.bind(this),
      methods = ['getHandlers', 'addHandler', 'removeHandler'];
    methods.forEach(method => requestHandler[method] = this[method].bind(this));
    return requestHandler;
  }

  /**
   * Sort the handlers by those with query params first
   *
   */
  getHandlers() {
    return this.handlers.sort((a, b) => b.hasQueryParams() - a.hasQueryParams());
  }
  addHandler(handler) {
    this.handlers.push(handler);
    return this.index++;
  }
  removeHandler(handler) {
    this.handlers = this.handlers.filter(h => h.mockId !== handler.mockId);
  }

  /**
   * This is the method that pretender will call to handle the request.
   *
   * Flip though the list of handlers to find one that matches and return
   * the response if one is found.
   *
   * Special handling for mock that use query params because they should take precedance over
   * a non query param mock find type since they share the same type / url.
   *
   * So, let's say you have mocked like this:
   *  ```
   *    let mockF = mockFindAll('user', 2);
   *    let mockQ = mockQuery('user', { name: 'Sleepy' });
   *  ```
   *  If your code does a query like this:
   *
   *   ```
   *    store.query('user', { name: 'Sleepy' });
   *   ```
   *
   *  Even thought the mockFindAll was declared first, the query handler will be used
   *
   * @param {FakeRequest} request pretenders object
   * @returns {[null,null,null]}
   */
  handleRequest(request) {
    let handler = this.getHandlers(request).find(handler => handler.matches(request));
    if (handler) {
      let {
        status,
        headers,
        responseText
      } = handler.getResponse();
      return [status, headers, responseText];
    }
  }
}

let wrappers = {},
  pretender = null,
  delay = 0;

/**
 * RequestManager controls setting up pretender to handle the mocks that are
 * created.
 *
 * For each request type / url like [GET /users] or [POST /user/1]
 * the request manager will assign a RequestWrapper class to handle it's response.
 *
 * This class will take the mock handler classes and assign them to a wrapper,
 * and also allow you to remove the handler or replace it from it's current
 * wrapper to new one.
 */
class RequestManager {
  /**
   * For now, you can only set the response delay.
   *
   * @param {Number} responseTime
   * @returns {{responseTime: number}} the current settings
   */
  static settings({
    responseTime
  } = {}) {
    if (isPresent(responseTime)) {
      delay = responseTime;
    }
    // return current settings
    return {
      responseTime: delay
    };
  }
  static getKey(type, url) {
    return [type, url].join(' ');
  }

  /**
   * Give each handler a mockId that is an object that holds information
   * about what it is mocking { type, url, num }
   *
   * @param {String} type like GET or POST
   * @param {String} url like '/users'
   * @param {Number} num a sequential number for each handler
   * @param handler
   */
  static assignMockId(type, url, num, handler) {
    handler.mockId = {
      type,
      url,
      num
    };
  }

  /**
   * Add a handler to the correct wrapper and assign it a mockId
   *
   * @param handler
   */
  static addHandler(handler) {
    let {
        type,
        url
      } = this.getTypeUrl(handler),
      key = this.getKey(type, url),
      wrapper = wrappers[key];
    if (!wrapper) {
      wrapper = new RequestWrapper();
      this.getPretender()[type.toLowerCase()].call(pretender, url, wrapper, delay);
      wrappers[key] = wrapper;
    }
    let index = wrapper.addHandler(handler);
    this.assignMockId(type, url, index, handler);
  }

  /**
   * Remove a handler from the wrapper it was in
   *
   * @param handler
   */
  static removeHandler(handler) {
    // get the old type, url info from last mockId
    // in order to find the wrapper it was in
    let {
        type,
        url
      } = handler.mockId,
      key = this.getKey(type, url),
      wrapper = wrappers[key];
    if (wrapper) {
      wrapper.removeHandler(handler);
    }
  }

  /**
   * Replace a handler from old wrapper to new one
   *
   * @param handler
   */
  static replaceHandler(handler) {
    this.removeHandler(handler);
    this.addHandler(handler);
  }

  // used for testing
  static findWrapper({
    handler,
    type,
    url
  }) {
    if (handler) {
      type = handler.getType();
      url = handler.getUrl();
    }
    let key = this.getKey(type, url);
    return wrappers[key];
  }
  static getTypeUrl(handler) {
    return {
      type: handler.getType(),
      url: handler.getUrl()
    };
  }
  static reset() {
    wrappers = {};
    pretender && pretender.shutdown();
    pretender = null;
    delay = 0;
  }
  static getPretender() {
    if (!pretender) {
      pretender = new Pretender();
    }
    return pretender;
  }
}

function Sequence (fn) {
  let index = 1;
  this.next = function () {
    return fn.call(this, index++);
  };
  this.reset = function () {
    index = 1;
  };
}

function MissingSequenceError (message) {
  this.toString = function () {
    return message;
  };
}

/**
 A ModelDefinition encapsulates a model's definition

 @param model
 @param config
 @constructor
 */
class ModelDefinition {
  constructor(model, config) {
    this.modelName = model;
    this.modelId = 1;
    this.originalConfig = mergeDeep({}, config);
    this.parseConfig(Object.assign({}, config));
  }

  /**
   Returns a model's full relationship if the field is a relationship.
    @param {String} field  field you want to relationship info for
   @returns {DS.Relationship} relationship object if the field is a relationship, null if not
   */
  getRelationship(field) {
    let modelClass = factoryGuy.store.modelFor(this.modelName);
    let relationship = modelClass.relationshipsByName.get(field);
    return relationship || null;
  }

  /**
   Get model fragment info ( if it exists )
    @param attribute
   @returns {Object} or null if no fragment info
   */
  modelFragmentInfo(attribute) {
    let modelClass = factoryGuy.store.modelFor(this.modelName);
    return modelClass.attributes.get(attribute);
  }

  /**
   Is this attribute a model fragment type
    @param {String} attribute  attribute you want to check
   @returns {Boolean} true if it's a model fragment
   */
  isModelFragmentAttribute(attribute) {
    let info = this.modelFragmentInfo(attribute);
    return !!(info && info.type && info.type.match('mf-fragment'));
  }

  /**
   Get actual model fragment type, in case the attribute name is different
   than the fragment type
    @param {String} attribute attribute name for which you want fragment type
   @returns {String} fragment type
   */
  fragmentType(attribute) {
    let info = this.modelFragmentInfo(attribute);
    let match = info.type.match('mf-fragment\\$(.*)');
    return match[1];
  }

  /**
   @param {String} name model name like 'user' or named type like 'admin'
   @returns {Boolean} true if name is this definitions model or this definition
   contains a named model with that name
   */
  matchesName(name) {
    return this.modelName === name || this.namedModels[name];
  }

  // Increment id
  nextId() {
    return this.modelId++;
  }

  // Decrement id
  backId() {
    return this.modelId--;
  }

  /**
   Call the next method on the named sequence function. If the name
   is a function, create the sequence with that function
    @param   {String} name previously declared sequence name or
   an the random name generate for inline functions
   @param   {Function} sequenceFn optional function to use as sequence
   @returns {String} output of sequence function
   */
  generate(name, sequenceFn) {
    if (sequenceFn) {
      if (!this.sequences[name]) {
        // create and add that sequence function on the fly
        this.sequences[name] = new Sequence(sequenceFn);
      }
    }
    let sequence = this.sequences[name];
    if (!sequence) {
      throw new MissingSequenceError(`[ember-data-factory-guy] Can't find that sequence named [${name}] in '${this.modelName}' definition`);
    }
    return sequence.next();
  }

  /**
   Build a fixture by name
    @param {String} name fixture name
   @param {Object} opts attributes to override
   @param {String} traitArgs array of traits
   @returns {Object} json
   */
  build(name, opts = {}, traitNames = [], buildType = 'build') {
    let modelAttributes = this.namedModels[name] || {};

    // merge default, modelAttributes, traits and opts to get the rough fixture
    let fixture = Object.assign({}, this.default, modelAttributes);

    // set the id, unless it was already set in opts
    if (!fixture.id && !opts.id) {
      // Setting a flag to indicate that this is a generated an id,
      // so it can be rolled back if the fixture throws an error.
      fixture._generatedId = true;
      fixture.id = this.nextId();
    }
    if (this.notPolymorphic !== undefined) {
      fixture._notPolymorphic = true;
    }
    traitNames.forEach(traitName => {
      let trait = this.traits[traitName];
      assert(`[ember-data-factory-guy] You're trying to use a trait [${traitName}] 
        for model ${this.modelName} but that trait can't be found.`, trait);
      if (typeOf(trait) === 'function') {
        trait(fixture);
      }
      Object.assign(fixture, trait);
    });
    Object.assign(fixture, opts);
    try {
      // deal with attributes that are functions or objects
      for (let attribute in fixture) {
        let attributeType = typeOf(fixture[attribute]);
        if (attributeType === 'function') {
          this.addFunctionAttribute(fixture, attribute, buildType);
        } else if (attributeType === 'object') {
          this.addObjectAttribute(fixture, attribute, buildType);
        }
      }
    } catch (e) {
      if (fixture._generatedId) {
        this.backId();
      }
      throw e;
    }
    if (factoryGuy.isModelAFragment(this.modelName)) {
      delete fixture.id;
    }
    delete fixture._generatedId;
    return fixture;
  }

  // function might be a sequence, an inline attribute function or an association
  addFunctionAttribute(fixture, attribute, buildType) {
    fixture[attribute] = fixture[attribute].call(this, fixture, buildType);
  }
  addObjectAttribute(fixture, attribute, buildType) {
    // If it's an object and it's a model association attribute, build the json
    // for the association and replace the attribute with that json
    let relationship = this.getRelationship(attribute);
    if (this.isModelFragmentAttribute(attribute)) {
      let payload = fixture[attribute];
      if (isEmptyObject(payload)) {
        // make a payload, but make sure it's the correct fragment type
        let actualType = this.fragmentType(attribute);
        payload = factoryGuy.buildRaw({
          name: actualType,
          opts: {},
          buildType
        });
      }
      // use the payload you have been given
      fixture[attribute] = payload;
    }
    if (relationship) {
      let payload = fixture[attribute];
      if (!payload.isProxy && !payload.links) {
        fixture[attribute] = factoryGuy.buildRaw({
          name: relationship.type,
          opts: payload,
          buildType
        });
      }
    }
  }

  /**
   Build a list of fixtures
    @param {String} name model name or named model type
   @param {Integer} number of fixtures to build
   @param {Array} array of traits to build with
   @param {Object} opts attribute options
   @returns array of fixtures
   */
  buildList(name, number, traits, opts, buildType) {
    return Array(number).fill().map(() => this.build(name, opts, traits, buildType));
  }

  // Set the modelId back to 1, and reset the sequences
  reset() {
    this.modelId = 1;
    for (let name in this.sequences) {
      this.sequences[name].reset();
    }
  }
  hasAfterMake() {
    return !!this.afterMake;
  }
  applyAfterMake(model, opts) {
    if (this.afterMake) {
      // passed in options override transient setting
      let options = Object.assign({}, this.transient, opts);
      this.afterMake(model, options);
    }
  }

  /*
   Need special 'merge' function to be able to merge objects with functions
    @param newConfig
   @param config
   @param otherConfig
   @param section
   */
  mergeSection(config, otherConfig, section) {
    let attr;
    if (otherConfig[section]) {
      if (!config[section]) {
        config[section] = {};
      }
      for (attr in otherConfig[section]) {
        if (!config[section][attr]) {
          config[section][attr] = otherConfig[section][attr];
        }
      }
    }
  }

  /**
   When extending another definition, merge it with this one by:
   merging only sequences, default section and traits
    @param {Object} config
   @param {ModelDefinition} otherDefinition
   */
  merge(config, otherDefinition) {
    let otherConfig = mergeDeep({}, otherDefinition.originalConfig);
    delete otherConfig.extends;
    this.mergeSection(config, otherConfig, 'sequences');
    // not sure why I have to use main definition for default,
    // but it works, so umm .. errr .. yeah
    this.mergeSection(config, otherDefinition, 'default');
    this.mergeSection(config, otherConfig, 'traits');
  }
  mergeConfig(config) {
    let extending = config.extends;
    let definition = factoryGuy.findModelDefinition(extending);
    assert(`[ember-data-factory-guy] You are trying to extend [${this.modelName}] with [ ${extending} ].
      But FactoryGuy can't find that definition [ ${extending} ]
      you are trying to extend. Make sure it was created/imported before
      you define [ ${this.modelName} ]`, definition);
    this.merge(config, definition);
  }
  parseDefault(config) {
    this.default = config.default || {};
    delete config.default;
  }
  parseTraits(config) {
    this.traits = config.traits || {};
    delete config.traits;
  }
  parseTransient(config) {
    this.transient = config.transient || {};
    delete config.transient;
  }
  parseCallBacks(config) {
    this.afterMake = config.afterMake;
    delete config.afterMake;
  }
  parsePolymorphicSetting(config) {
    if (config.polymorphic !== undefined && config.polymorphic === false) {
      this.notPolymorphic = true;
      delete config.polymorphic;
    }
  }
  parseSequences(config) {
    this.sequences = config.sequences || {};
    delete config.sequences;
    for (let sequenceName in this.sequences) {
      let sequenceFn = this.sequences[sequenceName];
      if (typeOf(sequenceFn) !== 'function') {
        throw new Error(`Problem with [${sequenceName}] sequence definition.
          Sequences must be functions`);
      }
      this.sequences[sequenceName] = new Sequence(sequenceFn);
    }
  }
  parseConfig(config) {
    if (config.extends) {
      this.mergeConfig(config);
    }
    this.parsePolymorphicSetting(config);
    this.parseSequences(config);
    this.parseTraits(config);
    this.parseDefault(config);
    this.parseTransient(config);
    this.parseCallBacks(config);
    this.namedModels = config;
  }
}

let modelDefinitions = {};
let Fragment;
if (macroCondition(dependencySatisfies('ember-data-model-fragments', '*'))) {
  Fragment = importSync('ember-data-model-fragments').default.Fragment;
}
class FactoryGuy {
  /**
   * Setting for FactoryGuy.
   *
   * responseTime: 0 is fastest
   * logLevel: 0 is off, 1 is on
   *
   * @param logLevel [0/1]
   */
  settings({
    logLevel = 0,
    responseTime = null
  } = {}) {
    RequestManager.settings({
      responseTime
    });
    this.logLevel = logLevel;
    return RequestManager.settings();
  }
  setStore(aStore) {
    assert(`[ember-data-factory-guy] FactoryGuy#setStore needs a valid store instance. You passed in [${aStore}]`, aStore instanceof Store);
    this.store = aStore;
    this.fixtureBuilderFactory = new FixtureBuilderFactory(this.store);
    this.afterDestroyStore(aStore);
  }
  fixtureBuilder(modelName) {
    return this.fixtureBuilderFactory.fixtureBuilder(modelName);
  }
  updateHTTPMethod(modelName) {
    return this.fixtureBuilder(modelName).updateHTTPMethod || 'PUT';
  }

  /**
   Is this model a fragment type
    @returns {Boolean} true if it's a model fragment
   */
  isModelAFragment(modelName) {
    if (Fragment) {
      let type = this.store.modelFor(modelName);
      return Fragment.detect(type);
    }
    return false;
  }

  /**
   ```javascript
    class Person extends Model {
     @attr('string') type
     @attr('string') name
   }
    FactoryGuy.define('person', {
     sequences: {
       personName: function(num) {
         return 'person #' + num;
       },
       personType: function(num) {
         return 'person type #' + num;
       }
     },
     default: {
       type: 'normal',
       name: FactoryGuy.generate('personName')
     },
     dude: {
       type: FactoryGuy.generate('personType')
     },
   });
    ```
    For the Person model, you can define named fixtures like 'dude' or
   just use 'person' and get default values.
    And to get those fixtures you would call them this way:
    FactoryGuy.build('dude') or FactoryGuy.build('person')
    @param {String} model the model to define
   @param {Object} config your model definition
   */
  define(model, config) {
    modelDefinitions[model] = new ModelDefinition(model, config);
  }

  /*
   @param model name of named fixture type like: 'admin' or model name like 'user'
   @returns {ModelDefinition} if there is one matching that name
   */
  findModelDefinition(model) {
    return modelDefinitions[model];
  }
  getModelDefinitions() {
    return modelDefinitions;
  }

  /**
   Used in model definitions to declare use of a sequence. For example:
    ```
    FactoryGuy.define('person', {
     sequences: {
       personName: function(num) {
         return 'person #' + num;
       }
     },
     default: {
       name: FactoryGuy.generate('personName')
     }
   });
    ```
    @param {String|Function} nameOrFunction value previously declared sequence name or
   an inline function to use as the sequence
   @returns {Function} wrapper function that is called by the model
   definition containing the sequence
   */
  generate(nameOrFunction) {
    let sortaRandomName = Math.floor((1 + Math.random()) * 65536).toString(16) + Date.now();
    return function () {
      // this function will be called by ModelDefinition, which has it's own generate method
      if (typeOf(nameOrFunction) === 'function') {
        return this.generate(sortaRandomName, nameOrFunction);
      } else {
        return this.generate(nameOrFunction);
      }
    };
  }

  /**
   Used in model definitions to define a belongsTo association attribute.
   For example:
    ```
   FactoryGuy.define('project', {
       default: {
         title: 'Project'
       },
        // setup named project with built in associated user
       project_with_admin: {
         user: FactoryGuy.belongsTo('admin')
       }
        // or use as a trait
       traits: {
         with_admin: {
           user: FactoryGuy.belongsTo('admin')
         }
       }
     })
   ```
    @param {String} name  fixture name
   @param {String} trait  optional trait names ( one or more )
   @param {Object} opts  optional fixture options that will override default fixture values
   @returns {Function} wrapper function that will build the association json
   */
  belongsTo(...originalArgs) {
    let args = FactoryGuy.extractArguments(...originalArgs);
    return (fixture, buildType) => {
      let modelName = FactoryGuy.lookupModelForFixtureName(args.name, true);
      if (this.isModelAFragment(modelName) && buildType === 'build') {
        return this.build(...originalArgs).get();
      }
      return this.buildRaw(Object.assign(args, {
        buildType
      }));
    };
  }

  /**
   Used in model definitions to define a hasMany association attribute.
   For example:
    ```
   FactoryGuy.define('user', {
     default: {
       name: 'Bob'
     },
      // define the named user type that will have projects
     user_with_projects: { FactoryGuy.hasMany('project', 2) }
      // or use as a trait
     traits: {
       with_projects: {
         projects: FactoryGuy.hasMany('project', 2)
       }
     }
   })
    ```
    @param {String} fixtureName fixture name
   @param {Number} number optional number of hasMany association items to build
   @param {String} trait optional trait names ( one or more )
   @param {Object} opts options
   @returns {Function} wrapper function that will build the association json
   */
  hasMany(...originalArgs) {
    let args = FactoryGuy.extractListArguments(...originalArgs);
    return (fixture, buildType) => {
      let modelName = FactoryGuy.lookupModelForFixtureName(args.name, true);
      if (this.isModelAFragment(modelName) && buildType === 'build') {
        return this.buildList(...originalArgs).get();
      }
      return this.buildRawList(Object.assign(args, {
        buildType
      }));
    };
  }

  /**
   Build fixtures for model or specific fixture name.
    For example:
    ```
    FactoryGuy.build('user') for User model
   FactoryGuy.build('bob') for a 'bob' User
   FactoryGuy.build('bob', 'dude') for a 'bob' User with dude traits
   FactoryGuy.build('bob', 'dude', 'funny') for a 'bob' User with dude and funny traits
   FactoryGuy.build('bob', 'dude', {name: 'wombat'}) for a 'bob' User with dude trait and custom attribute name of 'wombat'
    ```
    @param {String} name  fixture name
   @param {String} trait  optional trait names ( one or more )
   @param {Object} opts  optional fixture options that will override default fixture values
   @returns {Object} json fixture
   */
  build(...originalArgs) {
    let args = FactoryGuy.extractArguments(...originalArgs),
      modelName = FactoryGuy.lookupModelForFixtureName(args.name, true),
      fixture = this.buildRaw(Object.assign(args, {
        buildType: 'build'
      }));
    return this.fixtureBuilder(modelName).convertForBuild(modelName, fixture);
  }

  /**
   Find the factory definition and use that to build the fixture
    @param name fixture name
   @param {Array} traits trait names
   @param {Object} opts  fixture options that will override default fixture values
   @param buildType 'build' or 'make'
   @returns {Object}
   */
  buildRaw({
    name,
    opts,
    traits,
    buildType = 'build'
  } = {}) {
    let definition = FactoryGuy.lookupDefinitionForFixtureName(name, true);
    return definition.build(name, opts, traits, buildType);
  }

  /**
   Build list of fixtures for model or specific fixture name. For example:
    ```
    FactoryGuy.buildList('user') // for 0 User models
   FactoryGuy.buildList('user', 2) // for 2 User models
   FactoryGuy.build('bob', 2) // for 2 User model with bob attributes
   FactoryGuy.build('bob', 'with_car', ['with_car',{name: "Dude"}])
   // 2 User model with bob attributes, where the first also has 'with_car' trait
   // the last has 'with_car' trait and name of "Dude"
    ```
    @param {String} name  fixture name
   @param {Number} number optional number of fixtures to build
   @param {String} trait  optional traits (one or more)
   @param {Object} opts  optional fixture options that will override default fixture values
   @returns {Array} list of fixtures
   */
  buildList(...args) {
    this.ensureNameInArguments('buildList', args);
    args = FactoryGuy.extractListArguments(...args);
    let list = this.buildRawList(Object.assign(args, {
        buildType: 'build'
      })),
      modelName = FactoryGuy.lookupModelForFixtureName(args.name);
    return this.fixtureBuilder(modelName).convertForBuild(modelName, list);
  }

  /**
   Find the factory definition and use that to build the fixture.
    @param name fixture name
   @param {Array} traits trait names
   @param {Object} opts  fixture options that will override default fixture values
   @param buildType 'build' or 'make'
   @returns {Object}
   */
  buildRawList({
    name,
    number,
    opts,
    buildType = 'build'
  } = {}) {
    let definition = FactoryGuy.lookupDefinitionForFixtureName(name, true);
    if (number >= 0) {
      let parts = FactoryGuy.extractArgumentsShort(...opts);
      return definition.buildList(name, number, parts.traits, parts.opts, buildType);
    }
    return opts.map(function (innerArgs) {
      if (typeOf(innerArgs) !== 'array') {
        innerArgs = [innerArgs];
      }
      let parts = FactoryGuy.extractArgumentsShort(...innerArgs);
      return definition.build(name, parts.opts, parts.traits, buildType);
    });
  }

  /**
   Creates object with model attributes and relationships combined
   based on your traits and options
    @param {String} name  fixture name
   @param {String} trait  optional trait names ( one or more )
   @param {Object} options  optional fixture options that will override default fixture values
   @returns {Object} object with attributes and relationships combined
   */
  attributesFor(...originalArgs) {
    this.ensureStore();
    let args = FactoryGuy.extractArguments(...originalArgs),
      definition = FactoryGuy.lookupDefinitionForFixtureName(args.name, true),
      {
        modelName
      } = definition,
      fixture = this.buildRaw(Object.assign(args, {
        buildType: 'make'
      }));
    if (this.isModelAFragment(modelName)) {
      return fixture;
    }
    let data = this.fixtureBuilder(modelName).convertForMake(modelName, fixture);
    return data.data.attributes;
  }

  /**
   Make new model and save to store.
   If the model type is a fragment, return the raw fixture
    @param {String} name  fixture name
   @param {String} trait  optional trait names ( one or more )
   @param {Object} options  optional fixture options that will override default fixture values
   @returns {DS.Model} record
   */
  make(...originalArgs) {
    this.ensureStore();
    let args = FactoryGuy.extractArguments(...originalArgs),
      definition = FactoryGuy.lookupDefinitionForFixtureName(args.name, true),
      {
        modelName
      } = definition,
      fixture = this.buildRaw(Object.assign(args, {
        buildType: 'make'
      }));
    if (this.isModelAFragment(modelName)) {
      return join(() => this.store.createFragment(modelName, fixture));
    }
    let data = this.fixtureBuilder(modelName).convertForMake(modelName, fixture),
      model = join(() => this.store.push(data));
    if (definition.hasAfterMake()) {
      definition.applyAfterMake(model, args.opts);
    }
    return model;
  }

  /**
   Make new model.
    @param {String} name  fixture name
   @param {String} trait  optional trait names ( one or more )
   @param {Object} options  optional fixture options that will override default fixture values
   @returns {DS.Model} record
   */
  makeNew(...originalArgs) {
    this.ensureStore();
    let args = FactoryGuy.extractArguments(...originalArgs),
      modelName = FactoryGuy.lookupModelForFixtureName(args.name, true),
      fixture = this.buildRaw(Object.assign(args, {
        buildType: 'make'
      }));
    delete fixture.id;
    return join(() => this.store.createRecord(modelName, fixture));
  }

  /**
   Make a list of model instances
    ```
   FactoryGuy.makeList('bob') // makes 0 bob's
    FactoryGuy.makeList('bob', 2) // makes 2 bob's
    FactoryGuy.makeList('bob', 2, 'with_car' , {name: "Dude"})
   // makes 2 bob's that have 'with_car' trait and name of "Dude"
    FactoryGuy.makeList('bob', 'with_car', ['with_car',{name: "Dude"}])
   // 2 User model with bob attributes, where the first also has 'with_car' trait
   // the last has 'with_car' trait and name of "Dude"
   ```
    @param {String} name name of fixture
   @param {Number} number optional number of models to build
   @param {String} trait  optional trait names ( one or more )
   @param {Object} options  optional fixture options that will override default fixture values
   @returns {Array} list of json fixtures or records depending on the adapter type
   */
  makeList(...args) {
    this.ensureStore();
    this.ensureNameInArguments('makeList', args);
    let {
      name,
      number,
      opts
    } = FactoryGuy.extractListArguments(...args);
    this.ensureNameIsValid(name);
    if (number >= 0) {
      return Array(number).fill().map(() => this.make(...[name, ...opts]));
    }
    return opts.map(innerArgs => {
      if (typeOf(innerArgs) !== 'array') {
        innerArgs = [innerArgs];
      }
      return this.make(...[name, ...innerArgs]);
    });
  }
  ensureNameInArguments(method, args) {
    assert(`[ember-data-factory-guy] ${method} needs at least a name
      ( of model or named factory definition )`, args.length > 0);
  }
  ensureStore() {
    assert(`[ember-data-factory-guy] FactoryGuy does not have the application's store.
       Use setupFactoryGuy(this) in model/component test
       before using make/makeList`, this.store);
  }
  ensureNameIsValid(name) {
    FactoryGuy.lookupDefinitionForFixtureName(name, true);
  }
  reset() {
    this.resetDefinitions();
    this.resetMockAjax();
  }

  /**
   Reset all mock ajax calls
   */
  resetMockAjax() {
    RequestManager.reset();
  }

  /**
   Reset the id sequence for the models back to zero.
   */
  resetDefinitions() {
    for (let model in modelDefinitions) {
      let definition = modelDefinitions[model];
      definition.reset();
    }
  }

  /**
   Hook into store willDestroy to cleanup variables in Factory Guy and
   reset definitions/mock ajax setup.
    @param store
   */
  afterDestroyStore(store) {
    const self = this;
    const originalWillDestroy = store.willDestroy.bind(store);
    store.willDestroy = function () {
      originalWillDestroy();
      self.store = null;
      self.fixtureBuilderFactory = null;
      self.reset();
    };
  }

  /**
   Build url's for the mockjax calls. Proxy to the adapters buildURL method.
    @param {String} modelName model type name like 'user' for User model
   @param {String} id
   @param {String} snapshot usually null, but passing adapterOptions for GET requests
   @return {String} requestType string like 'findRecord', 'queryRecord'
   @return {String} queryParams optional
   */
  buildURL(modelName, id = null, snapshot, requestType, queryParams) {
    const adapter = this.store.adapterFor(modelName);
    const clonedQueryParams = Object.assign({}, queryParams);
    // some adapters can modify the query params so use a copy
    // so as not to modify the internal stored params
    // which are important later
    return adapter.buildURL(modelName, id, snapshot, requestType, clonedQueryParams);
  }

  /**
   Change reload behavior to only used cached models for find/findAll.
   You still have to handle query calls, since they always ajax for data.
    @params {Array} except list of models you don't want to mark as cached
   */
  cacheOnlyMode({
    except = []
  } = {}) {
    let store = this.store;
    let findAdapter = store.adapterFor.bind(store);
    store.adapterFor = function (name) {
      let adapter = findAdapter(name);
      let shouldCache = () => {
        if (isPresent(except)) {
          return A(except).includes(name);
        }
        return false;
      };
      adapter.shouldBackgroundReloadAll = shouldCache;
      adapter.shouldBackgroundReloadRecord = shouldCache;
      adapter.shouldReloadRecord = shouldCache;
      adapter.shouldReloadAll = shouldCache;
      return adapter;
    };
  }

  /**
   extract list arguments from makeList, buildList where the name should be first,
   and optionally a number next, or a list of traits and or options like:
    ['users', 2]  => {name: 'users', number: 2}
   ['users', 2, 'trait']  => {name: 'users', opts: ['trait']}
   ['users', 2, 'trait1', 'trait2' ] => {name: 'users', number: 2, opts: ['trait1', 'trait2']}
   ['users', 'trait1', 'trait2' ] =>
   {name: 'users', number: undefined, opts: ['trait1', 'trait2']}
   ['users', 'trait1', 'trait2', {name: 'Bob'} ] =>
   {name: 'users', number: undefined, opts: ['trait1', 'trait2', {name: 'Bob'}]}
    @param args
   @returns {{name: *, number: (*|number), opts: *[]}}
   */
  static extractListArguments(...args) {
    args = args.slice();
    let name = args.shift(),
      number = args[0] || 0;
    if (typeof number === 'number') {
      args.shift();
    } else {
      number = undefined;
    }
    return {
      name,
      number,
      opts: args
    };
  }

  /**
   extract arguments for build and make function
    @param {String} name  fixture name
   @param {String} trait  optional trait names ( one or more )
   @param {Object} opts  optional fixture options that will override default fixture values
   @returns {Object} json fixture
   */
  static extractArguments(...args) {
    args = args.slice();
    let name = args.shift();
    if (!name) {
      throw new Error('[ember-data-factory-guy] build/make needs a factory name to build');
    }
    return Object.assign({
      name
    }, FactoryGuy.extractArgumentsShort(...args));
  }
  static extractArgumentsShort(...args) {
    args = args.slice();
    let opts = {};
    if (typeOf(args[args.length - 1]) === 'object') {
      opts = args.pop();
    }
    // whatever is left are traits
    let traits = A(args).compact();
    return {
      opts,
      traits
    };
  }

  /**
    @param {String} name a fixture name could be model name like 'person'
   or a named person in model definition like 'dude'
   @param {Boolean} assertItExists true if you want to throw assertion if no definition found
   @returns {ModelDefinition} ModelDefinition associated with model or undefined if not found
   */
  static lookupDefinitionForFixtureName(name, assertItExists = false) {
    let definition;
    for (let model in modelDefinitions) {
      definition = modelDefinitions[model];
      if (definition.matchesName(name)) {
        return definition;
      }
    }
    assert(`[ember-data-factory-guy] Can't find that factory named [ ${name} ]`, !definition && assertItExists);
  }

  /**
   Given a fixture name like 'person' or 'dude' determine what model this name
   refers to. In this case it's 'person' for each one.
    @param {String} name  a fixture name could be model name like 'person'
   or a named person in model definition like 'dude'
   @returns {String} model  name associated with fixture name or undefined if not found
   */
  static lookupModelForFixtureName(name, assertItExists = false) {
    let definition = this.lookupDefinitionForFixtureName(name, assertItExists);
    if (definition) {
      return definition.modelName;
    }
  }
}
let factoryGuy = new FactoryGuy(),
  make = factoryGuy.make.bind(factoryGuy),
  makeNew = factoryGuy.makeNew.bind(factoryGuy),
  makeList = factoryGuy.makeList.bind(factoryGuy),
  build = factoryGuy.build.bind(factoryGuy),
  buildList = factoryGuy.buildList.bind(factoryGuy),
  attributesFor = factoryGuy.attributesFor.bind(factoryGuy);

class MockRequest {
  constructor() {
    this.status = 200;
    this.responseHeaders = {};
    this.responseJson = null;
    this.errorResponse = null;
    this.isDisabled = false;
    this.isDestroyed = false;
    this.timesCalled = 0;
  }

  /**
   * Set the adapter options that this mockCreate will be using
   *
   * @param {Object} options adapterOptions
   */
  withAdapterOptions(options) {
    this.adapterOptions = options;
    this.setupHandler();
    return this;
  }

  /**
   */
  get() {}

  /**
   * @returns {String}
   */
  getUrl() {}
  getType() {
    return 'GET';
  }
  returns(/*options = {}*/) {}
  addResponseHeaders(headers) {
    Object.assign(this.responseHeaders, headers);
  }
  succeeds(opts = {}) {
    this.status = opts.status || 200;
    this.errorResponse = null;
    return this;
  }
  isErrorStatus(status) {
    return !!status.toString().match(/^([345]\d{2})/);
  }
  fails(opts = {}) {
    let convertErrors = Object.prototype.hasOwnProperty.call(opts, 'convertErrors') ? opts.convertErrors : true,
      status = opts.status || 500,
      response = opts.response || null;
    assert(`[ember-data-factory-guy] 'fails' method status code must be 3XX, 4XX or 5XX,
        you are using: ${status}`, this.isErrorStatus(status));
    this.status = status;
    this.errorResponse = response;
    if (response && convertErrors) {
      let errors = this.fixtureBuilder.convertResponseErrors(response, this.status);
      this.errorResponse = errors;
    }
    return this;
  }

  // for a fails response, the response you might have set ( like a payload ) will
  // be discarded in favour of the error response that was built for you in fails method
  actualResponseJson() {
    let responseText = this.isErrorStatus(this.status) ? this.errorResponse : this.responseJson;
    return JSON.stringify(responseText);
  }
  getResponse() {
    return {
      responseText: this.actualResponseJson(),
      headers: this.responseHeaders,
      status: this.status
    };
  }
  logInfo() {
    if (factoryGuy.logLevel > 0) {
      const json = JSON.parse(this.getResponse().responseText),
        name = this.constructor.name.replace('Request', ''),
        type = this.getType(),
        status = `[${this.status}]`,
        url = this.getUrl();
      let fullUrl = url;
      if (!isEmptyObject(this.queryParams)) {
        fullUrl = [url, '?', param(this.queryParams)].join('');
      }
      const info = ['[factory-guy]', name, type, status, fullUrl, json];
      console.log(...info);
    }
  }
  withParams(queryParams) {
    this.queryParams = queryParams;
    return this;
  }
  hasQueryParams() {
    return !isEmptyObject(this.queryParams);
  }
  withSomeParams(someQueryParams) {
    this.someQueryParams = someQueryParams;
    return this;
  }
  paramsMatch(request) {
    if (!isEmptyObject(this.someQueryParams)) {
      return isPartOf(toParams(request.queryParams), toParams(this.someQueryParams));
    }
    if (!isEmptyObject(this.queryParams)) {
      return isEquivalent(toParams(request.queryParams), toParams(this.queryParams));
    }
    return true;
  }
  extraRequestMatches(request) {
    return this.paramsMatch(request);
  }
  matches(request) {
    if (this.isDisabled) {
      return false;
    }
    if (!this.extraRequestMatches(request)) {
      return false;
    }
    this.timesCalled++;
    this.logInfo();
    if (this.useOnce) {
      this.disable();
    }
    return true;
  }

  // mockId holds the url for this mock request
  oldUrl() {
    return this.mockId && this.mockId.url;
  }
  changedUrl() {
    return this.getUrl() !== this.oldUrl();
  }
  setupHandler() {
    if (!this.mockId) {
      RequestManager.addHandler(this);
    } else if (this.changedUrl()) {
      RequestManager.replaceHandler(this);
    }
  }

  // once the mock is used, it will disable itself, so it can't be used again.
  // most useful when using mockCreate to make the same type of model
  // over and over again, and the returning id is different.
  singleUse() {
    this.useOnce = true;
  }
  disable() {
    this.isDisabled = true;
  }
  enable() {
    this.isDisabled = false;
  }
  destroy() {
    RequestManager.removeHandler(this);
    this.isDestroyed = true;
  }
}

/* Disabling the following lint rules as `MockStoreRequest` and `MockGetRequest` contains a `this.get` method */
/* eslint-disable ember/no-get, ember/classic-decorator-no-classic-methods */
class MockStoreRequest extends MockRequest {
  constructor(modelName, requestType) {
    super();
    this.modelName = modelName;
    this.requestType = requestType;
    this.fixtureBuilder = factoryGuy.fixtureBuilder(this.modelName);
  }

  /**
   Used by getUrl to => this.get('id')
    MockGetRequest overrides this since those mocks have a payload with the id
    For mockDelete: If the id is null the url will not include the id, and
   can therefore be used to match any delete for this modelName
   */
  get(...args) {
    if (args[0] === 'id') {
      return this.id;
    }
  }

  /**
   * Using adapterOptions for snapshot in GET requests
   *
   * @returns {String}
   */
  getUrl() {
    return factoryGuy.buildURL(this.modelName, this.get('id'), this.makeFakeSnapshot(), this.requestType, this.queryParams);
  }

  /**
   * Create fake snaphot with adapterOptions and record
   *
   * @returns {{adapterOptions: (*|Object), record: (*|DS.Model)}}
   */
  makeFakeSnapshot() {
    let record = this.model;
    if (!record && this.get('id')) {
      record = factoryGuy.store.peekRecord(this.modelName, this.get('id'));
    }
    return {
      adapterOptions: this.adapterOptions,
      record
    };
  }
}

export { ActiveModelFixtureBuilder as A, FixtureBuilderFactory as F, JSONFixtureBuilder as J, MockStoreRequest as M, RequestManager as R, isEquivalent as a, isPartOf as b, parseUrl as c, paramsFromRequestBody as d, MockRequest as e, factoryGuy as f, makeNew as g, makeList as h, isEmptyObject as i, build as j, buildList as k, attributesFor as l, make as m, RESTFixtureBuilder as n, JSONAPIFixtureBuilder as o, param as p, MissingSequenceError as q, toParams as t };
//# sourceMappingURL=mock-store-request-CXG2KrX7.js.map
