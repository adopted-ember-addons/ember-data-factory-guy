import $ from 'jquery';

let MockGetRequest = function (url, modelName, responseJson) {
  let status = 200;
  let succeed = true;
  let response = {};

  this.andSucceed = function (options) {
    succeed = true;
    status = options && options.status || 200;

    return this;
  };

  this.andFail = function (options={}) {
    succeed = false;
    status = options.status || 500;
    response = options.response || {};

    return this;
  };

  this.handler = function () {
    if (succeed === false) {
      this.status = status;
      this.responseText = response;
    } else {
      this.status = status;
      this.responseText = responseJson;
    }
  };

  let requestConfig = {
    url: url,
    dataType: 'json',
    type: 'GET',
    response: this.handler
  };

  $.mockjax(requestConfig);
};

export default MockGetRequest;
