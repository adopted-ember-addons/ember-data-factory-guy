import Ember from 'ember';
import FactoryGuy from '../factory-guy';
import {isEquivalent} from '../utils/helper-functions';

export default class {

  constructor(url, modelName) {
    this.url = url;
    this.status = 200;
    this.modelName = modelName;
    this.succeed = true;
    this.matchArgs = {};
    this.returnArgs = {};
    this.responseJson = {};
    this.store = FactoryGuy.store;
    this.fixtureBuilder = FactoryGuy.fixtureBuilder;
    this.handler = this.setupHandler();
  }

  calculate() {
    if (this.succeed) {
      let modelClass = this.store.modelFor(this.modelName);
      this.responseJson = Ember.$.extend({}, this.matchArgs, this.returnArgs);
      // Remove belongsTo associations since they will already be set when you called
      // createRecord, so they don't need to be returned.
      Ember.get(modelClass, 'relationshipsByName').forEach((relationship)=> {
        if (relationship.kind === 'belongsTo') {
          delete this.responseJson[relationship.key];
        }
      });
    }
  }

  match(matches) {
    this.matchArgs = matches;
    this.calculate();
    return this;
  }

  returns(returns) {
    this.returnArgs = returns;
    this.calculate();
    return this;
  }

  fails(options = {}) {
    this.succeed = false;
    this.status = options.status || 500;
    if (options.response) {
      let errors = this.fixtureBuilder.convertResponseErrors(options.response);
      this.responseJson = errors;
    }
    return this;
  }

  /**
   * This is tricky, but the main idea here is:
   *
   * #1 Take the keys they want to match and transform them to what the serialized
   *  version would be ie. company => company_id
   *
   * #2 Take the matchArgs and turn them into a FactoryGuy payload class by
   *  FactoryGuy.build(ing) them into a payload
   *
   * #3 Wrap the request data into a FactoryGuy payload class
   *
   * #4 Go though the keys from #1 and check that both the payloads from #2/#3 have the
   * same values
   *
   * @param requestData
   * @returns {boolean} true is no attributes to match or they all match
   */
  attributesMatch(requestData) {
    if (Ember.isEmpty(Object.keys(this.matchArgs))) {
      return true;
    }

    let builder = this.fixtureBuilder;
    // transform they match keys

    let matchCheckKeys = Object.keys(this.matchArgs).map((key)=> {
      return builder.transformKey(this.modelName, key);
    });
    let buildOpts = { serializeMode: true, transformKeys: true };
    let expectedData = builder.convertForBuild(this.modelName, this.matchArgs, buildOpts);
    builder.wrapPayload(this.modelName, requestData);

    let allMatch = matchCheckKeys.map((key)=> {
      return isEquivalent(expectedData.get(key), requestData.get(key));
    }).every((value)=> value);
    return allMatch;
  }

  /*
   Setting the id at the very last minute, so that calling calculate
   again and again does not mess with id, and it's reset for each call.
   */
  modelId() {
    if (Ember.isPresent(this.returnArgs) && Ember.isPresent(this.returnArgs['id'])) {
      return this.returnArgs['id'];
    } else {
      let definition = FactoryGuy.findModelDefinition(this.modelName);
      return definition.nextId();
    }
  }

  setupHandler() {
    let handler = function(settings) {
      if (!(settings.url === this.url && settings.type === "POST")) {
        return false;
      }
      // need to clone the response since it could be used a few times in a row,
      // in a loop where you're doing createRecord of same model type
      let finalResponseJson = Ember.$.extend({}, true, this.responseJson);

      if (this.succeed) {
        if (this.matchArgs) {
          let requestData = JSON.parse(settings.data);
          if (!this.attributesMatch(requestData)) {
            return false;
          }
        }
        this.status = 200;
        // Setting the id at the very last minute, so that calling calculate
        // again and again does not mess with id, and it's reset for each call
        finalResponseJson.id = this.modelId();
        finalResponseJson = this.fixtureBuilder.convertForBuild(this.modelName, finalResponseJson);
      } else {
        this.status = status;
      }

      return {
        responseText: finalResponseJson,
        status: this.status
      };

    }.bind(this);

    Ember.$.mockjax(handler);

    return handler;
  }

}