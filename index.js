var path = require('path');

module.exports = {
  name: 'ember-data-factory-guy',

  included: function(app) {
    this._super.included(app);
    this.app = app;
    // need to load mockjax in development and test environment since ember tests
    // can be run from browser in development mode
    if (app.tests) {
      app.import(app.bowerDirectory + '/jquery-mockjax/dist/jquery.mockjax.js');
    }
  },

  treeFor: function(name) {
    if(this.app.tests) {
      return this._super.treeFor.apply(this, arguments);
    }
  }
};
