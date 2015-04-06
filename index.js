var path = require('path');

module.exports = {
  name: 'ember-data-factory-guy',

  blueprintsPath: function() {
    return path.join(__dirname, 'blueprints');
  },

  included: function(app) {
    this._super.included(app);
    console.log('included ember-data-factory-guy index.js ('+app.tests+') #####');
  }

};
