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
    console.log('included index.js #####', this.app.env, app.tests)
    this.app = app;

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
  },

  //treeFor: function(name) {
    //if (this.app.env !== 'production') {
    //this._super.treeFor.apply(this, arguments);
    //console.log('tree for'+name, tree);
    //return tree;
    //}
    //this._requireBuildPackages();
    //return this.mergeTrees([]);
  //},

  shouldIncludeFiles: function() {
    //var config = this.app.project.config()['ember-data-factory-guy'];

    //return config.force || (this.app.env !== 'production')
  }

};
