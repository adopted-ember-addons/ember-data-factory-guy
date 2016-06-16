var path = require('path');
var fs = require('fs');
var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');
var EmberApp = require('ember-cli/lib/broccoli/ember-app');
//    http://discuss.emberjs.com/t/best-practices-accessing-app-config-from-addon-code/7006
module.exports = {
  name: 'ember-data-factory-guy',

  included: function(app) {
    this._super.included(app);
    this.app = app;

    // need to load mockjax in development and test environment since ember tests
    // can be run from browser in development mode
    var env = EmberApp.env();

//    console.log('env', env );
//    var factoryDefinitions = new Funnel('tests/factories', {
//      srcDir: '/',
//      include: ['**/*.js'],
//      destDir: '/assets/vendor'
//    });
//    console.log('factoryDefinitions', factoryDefinitions);
    
//    return app.toTree(factoryDefinitions);
    if (app.tests) {
      app.import(app.bowerDirectory + '/jquery-mockjax/dist/jquery.mockjax.js');
    }
  },
//  isDevelopingAddon: function() { return true; },

  treeForApp(appTree) {
    var trees = [ appTree ];

    try {
      if (fs.statSync('tests/factories').isDirectory()) {
        var factoriesTree = new Funnel('tests/factories', {
            destDir: 'factories'
        });
        trees.push(factoriesTree);
      }
    } catch (err) {
      // do nothing;
    }

    
    return mergeTrees(trees);
  },

  treeFor: function(name) {
    if(this.app.tests) {
      return this._super.treeFor.apply(this, arguments);
    }
  }
};
