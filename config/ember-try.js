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
          'ember': 'components/ember#2.4',
          'ember-data': 'components/ember-data#2.4'
        },
        resolutions: {
          'ember': '2.4',
          'ember-data': '2.4'
        }
      }
    },
    {
      name: 'ember/ember-data#release',
      bower: {
        dependencies: {
          'ember': 'components/ember#release',
          'ember-data': 'components/ember-data#release'
        },
        resolutions: {
          'ember': 'release',
          'ember-data': 'release'
        }
      }
    },
    {
      name: 'ember/ember-data#beta',
      bower: {
        dependencies: {
          'ember': 'components/ember#beta',
          'ember-data': 'components/ember-data#beta'
        },
        resolutions: {
          'ember': 'beta',
          'ember-data': 'beta'
        }
      }
    },
    {
      name: 'ember/ember-data#canary',
      bower: {
        dependencies: {
          'ember': 'components/ember#canary',
          'ember-data': 'components/ember-data#canary'
        },
        resolutions: {
          'ember': 'canary',
          'ember-data': 'canary'
        }
      }
    }
  ]
};
