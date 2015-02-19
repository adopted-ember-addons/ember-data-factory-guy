var MockUpdateRequest = function(url, model, mapFind, options) {
	var status = options.status || 200;
	var succeed = options.succeed || true;

	this.andReturn = function(returns) {
		return this;
	};

	this.andFail = function(options) {
		succeed = false;
		status = options.status || 500;
		return this;
	};

	this.handler = function(settings) {
		if (!succeed) {
			this.status = status;
		} else {
			var json = model.toJSON({includeId: true});
			this.responseText = mapFind(model.constructor.typeKey, json);
			this.status = 200;
		}
	};

	var requestConfig = {
		url: url,
		dataType: 'json',
		type: 'PUT',
		status: status,
		response: this.handler
	};

	$.mockjax(requestConfig);
};