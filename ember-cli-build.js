const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function (defaults) {
  let app = new EmberAddon(defaults, {
    'ember-fetch': {
      preferNative: true,
    },
  });

  return app.toTree();
};
