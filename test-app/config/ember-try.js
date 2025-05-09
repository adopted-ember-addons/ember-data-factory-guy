'use strict';

const getChannelURL = require('ember-source-channel-url');
const { embroiderSafe, embroiderOptimized } = require('@embroider/test-setup');

module.exports = async function () {
  return {
    packageManager: 'pnpm',
    scenarios: [
      {
        name: 'ember-lts-4.12',
        npm: {
          devDependencies: {
            'ember-source': '~4.12',
            'ember-qunit': '^7 || ^8', // ember-qunit v6 is last release supporting ember-source < 4
            '@ember/test-helpers': '^3.0.3', // req of ember-qunit 7
            'ember-resolver': '^9 || ^10 || ^11 || ^12 || ^13',
          },
        },
      },
      {
        name: 'ember-lts-5.12',
        npm: {
          devDependencies: {
            'ember-source': '~5.12',
            'ember-qunit': '^7 || ^8',
            '@ember/test-helpers': '^3.0.3',
            'ember-resolver': '^10.1.1 || ^11 || ^12 || ^13', // v10.1.1 first to support ember 5+
            'ember-load-initializers': '^3.0.0', // v3 needed for ember 5+
            'ember-data': '~5.3', // couldnt get earlier versions to work with ember-source 5.12
            'ember-data-model-fragments': null, // does not support ED > 4.6
            'ember-inflector': '^6.0.0', // higher ED version needs this
            'active-model-adapter': '^4.0.0', // higher ED version needs this
          },
        },
      },
      {
        name: 'ember-6.4',
        npm: {
          devDependencies: {
            'ember-source': '~6.4',
            'ember-qunit': '^7 || ^8',
            '@ember/test-helpers': '^3.0.3',
            'ember-resolver': '^10.1.1 || ^11 || ^12 || ^13',
            'ember-load-initializers': '^3.0.0',
            'ember-data': '~5.3', // earliest version that supports ember 6
            'ember-data-model-fragments': null,
            'ember-inflector': '^6.0.0',
            'active-model-adapter': '^4.0.0',
          },
        },
      },
      {
        name: 'ember-release',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('release'),
            'ember-qunit': '^7 || ^8',
            '@ember/test-helpers': '^3.0.3',
            'ember-resolver': '^10.1.1 || ^11 || ^12 || ^13',
            'ember-load-initializers': '^3.0.0',
            'ember-data': '~5.3',
            'ember-data-model-fragments': null,
            'ember-inflector': '^6.0.0',
            'active-model-adapter': '^4.0.0',
          },
        },
      },
      embroiderSafe(),
      embroiderOptimized(),
      {
        name: 'ember-default-with-jquery',
        npm: {
          devDependencies: {
            '@ember/jquery': '^1.1.0',
          },
        },
      },
      {
        name: 'ember-classic',
        env: {
          EMBER_OPTIONAL_FEATURES: JSON.stringify({
            'application-template-wrapper': true,
            'template-only-glimmer-components': false,
          }),
        },
        npm: {
          ember: {
            edition: 'classic',
          },
        },
      },
    ],
  };
};
