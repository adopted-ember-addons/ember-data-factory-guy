var path = require('path');

module.exports = {
  name: 'ember-data-factory-guy',

  blueprintsPath: function() {
    return path.join(__dirname, 'blueprints');
  },

  included: function(app) {
    this._super.included(app);
    console.log('included index.js start #####', app, __dirname);
    app.dan = 'dude';
    console.log('included index.js end #####');
    if (app.tests) {
      app.import(app.bowerDirectory + '/jquery-mockjax/jquery.mockjax.js');
      app.import(app.bowerDirectory + '/sinonjs/sinon.js');
    }
  }

};
