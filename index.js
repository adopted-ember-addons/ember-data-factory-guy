/*jshint node: true */
'use strict';
var fs = require('fs');
var path = require('path');
var mergeTrees = require('broccoli-merge-trees');
var Funnel = require('broccoli-funnel');

module.exports = {
  name: 'ember-data-factory-guy',

  treeForVendor: function() {
    var files = [];

    var urijsPath = path.dirname(require.resolve('urijs'));
    files.push(new Funnel(urijsPath, {
      files: [
        'URI.js'
      ],
      destDir: 'urijs'
    }));

    return mergeTrees(files);
  },

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
      app.import(path.join('vendor', 'urijs', 'URI.js'));
    }
  },

  includeFactoryGuyFiles: function() {
    var includeFiles = false;

    if (this.app.env === 'test') {
      includeFiles = true;

      if (this.factoryGuyEnabled) {
        includeFiles = this.factoryGuyEnabled;
      }
    } else {
      includeFiles = this.factoryGuyEnabled;
    }

    return includeFiles;
  },

  treeFor: function(name) {
    if (!this.includeFactoryGuyFiles()) {
      return;
    }

    return this._super.treeFor.apply(this, arguments);
  }
};
