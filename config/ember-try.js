/*jshint node:true*/
module.exports = {
  scenarios: [
    {
      name: 'default',
      bower: {
        devDependencies: {}
      }
    },
    {
      name: 'ember-ember-data-2.11',
      npm: {
        devDependencies: {
          'ember-source': '2.11',
          'ember-data': '2.11',
          'ember-data-model-fragments': '2.11',
          'ember-inflector': '1.9.4'
        }
      }
    },
    {
      name: 'ember-ember-data-2.14',
      npm: {
        devDependencies: {
          'ember-source': '2.14',
          'ember-data': '2.14',
          'ember-data-model-fragments': '2.14'
        }
      }
    },
    {
      name: 'ember-ember-data-release',
      bower: {
        devDependencies: {
          'ember': 'components/ember#release'
        },
        resolutions: {
          'ember': 'release'
        }
      },
      npm: {
        devDependencies: {
          'ember-data': 'release'
        }
      }
    },
    {
      name: 'ember-ember-data-beta',
      bower: {
        devDependencies: {
          'ember': 'components/ember#beta'
        },
        resolutions: {
          'ember': 'beta'
        }
      },
      npm: {
        devDependencies: {
          'ember-data': 'beta'
        }
      }
    },
    {
      name: 'ember-ember-data-canary',
      bower: {
        devDependencies: {
          'ember': 'components/ember#canary'
        },
        resolutions: {
          'ember': 'canary'
        }
      },
      npm: {
        devDependencies: {
          'ember-data': 'canary'
        }
      }
    }
  ]
};
