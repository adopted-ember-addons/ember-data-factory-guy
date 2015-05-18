import $ from 'jquery';

var MockGetRequest = function (url, modelName, record, mapFind) {
  var status = 200;
  var succeed = true;
  var response = null;

  this.andSucceed = function (options) {
    succeed = true;
    status = options && options.status || 200;

    return this;
  };

  this.andFail = function (options) {
    console.log('INFO: andFail is called');
    options = options || {};
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
      this.responseText = mapFind(
        modelName,
        record.toJSON({
          includeId: true
        })
      );
    }
  };

  var requestConfig = {
    url: url,
    dataType: 'json',
    type: 'GET',
    response: this.handler
  };

  $.mockjax(requestConfig);
};

export default MockGetRequest;
