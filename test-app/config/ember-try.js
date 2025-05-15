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
          },
        },
      },
      {
        name: 'ember-6.4',
        npm: {
          devDependencies: {
            'ember-source': '~6.4',
            'ember-load-initializers': '^3.0.0',
          },
        },
      },
      {
        name: 'ember-release',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('release'),
            'ember-load-initializers': '^3.0.0',
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
