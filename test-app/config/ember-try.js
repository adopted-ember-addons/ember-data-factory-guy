'use strict';

const getChannelURL = require('ember-source-channel-url');
const { embroiderSafe, embroiderOptimized } = require('@embroider/test-setup');

module.exports = async function () {
  return {
    packageManager: 'pnpm',
    npmOptions: ['--config.strict-peer-dependencies=false'],
    scenarios: [
      {
        name: 'ember-lts-5.12',
        npm: {
          devDependencies: {
            'ember-source': '~5.12',
            'ember-load-initializers': '^3.0.0', // v3 needed for ember 5+
            'ember-data': '~5.3', // couldnt get earlier versions to work with ember-source 5.12
            'ember-data-model-fragments': null, // does not support ED > 4.6
            'ember-inflector': '^6.0.0', // higher ED version needs this
          },
        },
      },
      {
        name: 'ember-6.4',
        npm: {
          devDependencies: {
            'ember-source': '~6.4',
            'ember-load-initializers': '^3.0.0',
            'ember-data': '~5.3', // earliest version that supports ember 6
            'ember-data-model-fragments': null,
            'ember-inflector': '^6.0.0',
          },
        },
      },
      {
        name: 'ember-release',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('release'),
            'ember-load-initializers': '^3.0.0',
            'ember-data': '~5.3',
            'ember-data-model-fragments': null,
            'ember-inflector': '^6.0.0',
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
    ],
  };
};
