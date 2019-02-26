/* global require */
/* eslint-env node */
var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {

  var app = new EmberAddon(defaults, {
    // Any other options
    'ember-cli-babel': {
      includePolyfill: true
    },
    'ember-fetch': {
      preferNative: true
    }
  });

  return app.toTree();
};
