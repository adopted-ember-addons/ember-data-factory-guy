const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    emberData: {
      deprecations: {
        DEPRECATE_STORE_EXTENDS_EMBER_OBJECT: false, // error if using store emberobject methods
      },
    },
    '@embroider/macros': {
      setConfig: {
        'ember-data-factory-guy': {
          useStringIdsOnly: true,
        },
      },
    },
  });

  return app.toTree();
};
