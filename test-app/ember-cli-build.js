const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = async function (defaults) {
  let app = new EmberApp(defaults, {
    '@embroider/macros': {
      setConfig: {
        'ember-data-factory-guy': {
          useStringIdsOnly: true,
          interceptor: process.env.INTERCEPTOR || 'pretender',
        },
      },
    },
  });

  const { setConfig } = await import('@warp-drive/build-config');
  setConfig(app, __dirname, {
    deprecations: {
      DEPRECATE_STORE_EXTENDS_EMBER_OBJECT: false, // error if using store emberobject methods
    },
  });

  return app.toTree();
};
