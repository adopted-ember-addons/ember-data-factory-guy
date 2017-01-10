/*jshint node: true */
'use strict';
var fs = require('fs');
var path = require('path');
var mergeTrees = require('broccoli-merge-trees');
var Funnel = require('broccoli-funnel');

module.exports = {
  name: 'ember-data-factory-guy',

  treeForApp: function(appTree) {
    var trees = [appTree];

    if (this.includeFactoryGuyFiles()) {
      try {
        if (fs.statSync('tests/factories').isDirectory()) {
          var factoriesTree = new Funnel('tests/factories', {
            destDir: 'tests/factories'
          });
          trees.push(factoriesTree);
        }
      } catch (err) {
        // do nothing;
      }
    }

    return mergeTrees(trees);
  },

  included: function(app) {
    this._super.included(app);
    this.app = app;
    this.factoryGuyEnabled = Boolean(this.app.project.config(app.env).factoryGuy);

    if (this.includeFactoryGuyFiles()) {
      app.import(path.join(app.bowerDirectory, 'jquery-mockjax', 'dist', 'jquery.mockjax.js'));
    }
  },

  includeFactoryGuyFiles: function() {
    var includeFiles = false;

    if (this.app.env.match(/test/)) {
      includeFiles = true;
    } else {
      includeFiles = this.factoryGuyEnabled;
    }

    return includeFiles;
  },

  treeFor: function(name) {
    // Not sure why this is necessary, but this stops the factory guy files
    // from being added to app tree. Would have thought that this would have
    // happened in treeForApp above, but not the case
    if (!this.includeFactoryGuyFiles() && name === 'app') {
      return;
    }
    return this._super.treeFor.apply(this, arguments);
  }
};
