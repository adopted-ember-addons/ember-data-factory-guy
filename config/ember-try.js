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
      name: 'ember-ember-data-2.6',
      bower: {
        devDependencies: {
          'ember': 'components/ember#2.6'
        },
        resolutions: {
          'ember': '2.6'
        }
      },
      npm: {
        devDependencies: {
          'ember-data': 'emberjs/data#2.6',
          'ember-data-model-fragments': '2.3.3'
        },
        resolutions: {
          'ember-data': '2.6',
          'ember-data-model-fragments': '2.3.3'
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
          'ember-data': 'emberjs/data#release'
        },
        resolutions: {
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
          'ember-data': 'emberjs/data#beta'
        },
        resolutions: {
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
          'ember-data': 'emberjs/data#canary'
        },
        resolutions: {
          'ember-data': 'canary'
        }
      }
    }
  ]
};
