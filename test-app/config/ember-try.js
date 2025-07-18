'use strict';

const { embroiderSafe, embroiderOptimized } = require('@embroider/test-setup');

module.exports = async function () {
  return {
    packageManager: 'pnpm',
    // enable if needed
    // npmOptions: ['--config.strict-peer-dependencies=false'],
    scenarios: [
      {
        name: 'msw-only',
        env: {
          INTERCEPTOR: 'msw',
        },
        npm: {
          devDependencies: {
            pretender: null,
          },
        },
      },
      {
        name: 'pretender-only',
        env: {
          INTERCEPTOR: 'pretender',
        },
        npm: {
          devDependencies: {
            msw: null,
          },
        },
      },
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
            'ember-source': 'latest',
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
      {
        name: 'ember-data-5.5',
        npm: {
          devDependencies: {
            'ember-data': '~5.5',
          },
        },
      },
    ],
  };
};
