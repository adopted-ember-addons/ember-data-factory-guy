var path = require('path');

module.exports = {
  name: 'factory-guy',

  blueprintsPath: function() {
    return path.join(__dirname, 'blueprints');
  },

  included: function(app) {
    this._super.included(app);
    console.log('included factory-guy index.js ('+app.tests+') '+app.bowerDirectory+'#####');
    if (app.tests) {
      app.import(app.bowerDirectory + '/jquery-mockjax/jquery.mockjax.js');
    }
  }

};
