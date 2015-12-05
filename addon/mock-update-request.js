import $ from 'jquery';
import FactoryGuy from './factory-guy';

var MockUpdateRequest = function(url, model, options) {
  var status = options.status || 200;
  var succeed = true;
  var response = null;

  if ('succeed' in options) {
    succeed = options.succeed;
  }

  if ('response' in options) {
    response = options.response;
  }

  this.andSucceed = function(options) {
    succeed = true;
    status = options && options.status || 200;
    return this;
  };

  this.andFail = function(options) {
    succeed = false;
    status = options.status || 500;
    if ('response' in options) {
      response = options.response;
    }
    return this;
  };

  this.handler = function() {
    if (!succeed) {
      this.status = status;
      if (response !== null) {
        this.responseText = response;
      }
    } else {
      // need to use serialize instead of toJSON to handle polymorphic belongsTo
      var json = model.serialize({includeId: true});
      this.responseText = FactoryGuy.get('fixtureBuilder').normalize(model.constructor.modelName, json);
      this.status = 200;
    }
  };
  var requestConfig = {
    url: url,
    dataType: 'json',
    type: FactoryGuy.get('updateHTTPMethod'),
    response: this.handler
  };

  $.mockjax(requestConfig);
};

export default MockUpdateRequest;
