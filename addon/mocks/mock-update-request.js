import Ember from 'ember';
import $ from 'jquery';
import FactoryGuy from '../factory-guy';

let MockUpdateRequest = function(url, model, options) {
  let status = options.status || 200;
  let succeed = true;
  let response = null;
  this.timesCalled = 0;
  let self = this;

  if ('succeed' in options) {
    Ember.deprecate(
      `[ember-data-factory-guy] TestHelper.mockUpdate - options.succeed has been deprecated.
        Use chainable method \`succeeds(options)\` method instead`,
      options.hasOwnProperty('succeed'),
      { id: 'ember-data-factory-guy.handle-update', until: '2.4.0' }
    );
    succeed = options.succeed;
  }

  if ('response' in options) {
    response = options.response;
  }

  this.andSucceed = function(options) {
    Ember.deprecate("`andSucceed` - has been deprecated. Use `succeeds(options)` method instead`",
      false, { id: 'ember-data-factory-guy.and-succeed', until: '2.4.0' });
    return this.succeeds(options);
  };

  this.succeeds = function(options) {
    succeed = true;
    status = options && options.status || 200;
    return this;
  };

  this.andFail = function(options = {}) {
    Ember.deprecate("`andFail` - has been deprecated. Use `fails(options)` method instead`",
      false, { id: 'ember-data-factory-guy.and-fail', until: '2.4.0' });
    return this.fails(options);
  };

  this.fails = function(options) {
    succeed = false;
    status = options.status || 500;
    if ('response' in options) {
      response = options.response;
    }
    return this;
  };

  this.handler = function() {
    self.timesCalled++;
    if (!succeed) {
      this.status = status;
      if (response !== null) {
        this.responseText = response;
      }
    } else {
      // need to use serialize instead of toJSON to handle polymorphic belongsTo
      let json = model.serialize({includeId: true});
      this.responseText = FactoryGuy.fixtureBuilder.normalize(model.constructor.modelName, json);
      this.status = 200;
    }
  };
  let requestConfig = {
    url: url,
    dataType: 'json',
    type: FactoryGuy.updateHTTPMethod(),
    response: this.handler
  };

  $.mockjax(requestConfig);
};

export default MockUpdateRequest;
