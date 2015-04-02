var path = require('path');

module.exports = {
  name: 'ember-data-factory-guy',

  isDevelopingAddon: function() {
    return true;
  },

  blueprintsPath: function() {
    return path.join(__dirname, 'blueprints');
  },

  included: function(app) {
    this._super.included(app);
    console.log('included #####', app.tests)
    if (app.tests) {
      app.import(app.bowerDirectory + '/jquery-mockjax/jquery.mockjax.js');
      //app.import(app.bowerDirectory + '/ember-data-factory-guy');
      //  exports: {
      //    'factory-guy': [
      //      'default',
      //      'modelDefinition',
      //      'sequence',
      //      'testMixin'
      //    ]
      //  }
      //});
    }
  }
};
