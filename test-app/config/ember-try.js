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
      // Tests compatibility with WarpDrive in legacy mode — i.e., using the explicit
      // @warp-drive/* and @ember-data/* packages without the ember-data umbrella,
      // but still using @ember-data/model + adapters/serializers via legacy-compat.
      // This mirrors the setup of users who have started their WarpDrive migration.
      {
        name: 'warp-drive-legacy',
        npm: {
          devDependencies: {
            'ember-data': null, // replaced by explicit packages below
            'ember-source': '~5.12',
            'ember-load-initializers': '^3.0.0',
            '@warp-drive/ember': '5.8.2',
            '@ember-data/store': '5.8.2',
            '@ember-data/model': '5.8.2',
            '@ember-data/adapter': '5.8.2',
            '@ember-data/serializer': '5.8.2',
            '@ember-data/legacy-compat': '5.8.2',
            '@ember-data/json-api': '5.8.2',
            '@ember-data/request': '5.8.2',
            '@ember-data/request-utils': '5.8.2',
            '@ember-data/tracking': '5.8.2',
            'ember-provide-consume-context': '^0.9.0',
          },
        },
      },
    ],
  };
};
