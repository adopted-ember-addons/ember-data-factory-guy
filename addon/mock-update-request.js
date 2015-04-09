import $ from 'jquery';

var MockUpdateRequest = function(url, model, mapFind, options) {
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
    console.log('MUR handler', 'succeed',succeed)
		if (!succeed) {
			this.status = status;
      if (response !== null) {
        this.responseText = response;
      }
		} else {
      console.log('MUR else', 'model',model+'')
			var json = model.toJSON({includeId: true});
      console.log('MUR json', json)
      console.log('MUR json2', mapFind(model.constructor.typeKey, json))
			this.responseText = mapFind(model.constructor.typeKey, json);
			this.status = 200;
		}
	};

	var requestConfig = {
		url: url,
		dataType: 'json',
		type: 'PUT',
		response: this.handler
	};

	$.mockjax(requestConfig);
};

export default MockUpdateRequest;
