var path = require('path');

module.exports = {
  name: 'ember-data-factory-guy',

  blueprintsPath: function() {
    return path.join(__dirname, 'blueprints');
  },

  included: function(app) {
    this._super.included(app);
    // need to load mockjax in development and test environment since ember tests
    // can be run from browser in development mode
    if (app.tests) {
      app.import(app.bowerDirectory + '/jquery-mockjax/dist/jquery.mockjax.js');
    }
  }

};
