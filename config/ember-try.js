/*jshint node:true*/
module.exports = {
  scenarios: [
    {
      name: 'default',
      bower: {
        dependencies: {}
      }
    },
    {
      name: 'ember/ember-data#2.4',
      bower: {
        dependencies: {
          'ember': 'components/ember#2.4'
        },
        resolutions: {
          'ember': '2.4'
        }
      },
      npm: {
        devDependencies: {
          'ember-data': '2.4'
        }
      }
    },
    {
      name: 'ember/ember-data#release',
      bower: {
        dependencies: {
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
      name: 'ember/ember-data#beta',
      bower: {
        dependencies: {
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
      name: 'ember/ember-data#canary',
      bower: {
        dependencies: {
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
