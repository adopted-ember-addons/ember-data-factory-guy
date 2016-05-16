var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {

  var app = new EmberAddon(defaults, {
    // Any other options
    babel: {
      includePolyfill: true
    }
  });

  app.import('bower_components/jquery-mockjax/dist/jquery.mockjax.js');
  app.import('bower_components/sinon/index.js');

  return app.toTree();
};

///* jshint node: true */
//'use strict';
//
//var BabelTranspiler = require('broccoli-babel-transpiler');
//var Funnel = require('broccoli-funnel');
//var MergeTrees = require('broccoli-merge-trees');
//
//module.exports = {
//  name: 'ember-d3-helpers',
//
//  treeForAddon: function() {
//    if (this.isDevelopingAddon()) {
//      // get the base addon tree
//      var addonTree = this._super.treeForAddon.apply(this, arguments);
//
//
//      // transpile the simple-dom sources into ES5. However, we want
//      // to leave the ES6 module declaration in place because they'll be
//      // handled later by ember-cli.
//      var transpiled = new BabelTranspiler('node_modules/simple-dom/lib/simple-dom', {
//        loose: true,
//        blacklist: ['es6.modules']
//      });
//
//
//      // take the transpiled simple dom sources and put them into
//      // ember-cli build will pick them up.
//      var simpleDom = new Funnel(transpiled, {
//        destDir: 'modules/simple-dom'
//      });
//
//      return new MergeTrees([addonTree, simpleDom]);
//    }
//
//    return this._super.treeForAddon.apply(this, arguments);
//  }
