/* global require, module */
var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {

  var app = new EmberAddon(defaults, {
    // Any other options
    babel: {
      includePolyfill: true
    }
  });

  app.import('bower_components/jquery-mockjax/dist/jquery.mockjax.js');

  return app.toTree();
};
