var path = require('path');

module.exports = {
  name: 'Ember Data Factory Guy',

  blueprintsPath: function() {
    return path.join(__dirname, 'blueprints');
  },

  included: function(app) {
    this._super.included(app);

    if (app.env !== 'production') {
      app.import(app.bowerDirectory + '/jquery-mockjax/jquery.mockjax.js');
      app.import(app.bowerDirectory + '/ember-data-factory-guy/dist/amd/factory-guy.js', {
        exports: {
          'factory-guy': [
            'default',
            'modelDefinition',
            'sequence',
            'testMixin'
          ]
        }
      });
    }
  }
};
