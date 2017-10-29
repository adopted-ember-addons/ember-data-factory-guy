/* eslint-env node */
'use strict';
var fs = require('fs');
var path = require('path');
var MergeTrees = require('broccoli-merge-trees');
var Funnel = require('broccoli-funnel');

module.exports = {
  name: 'ember-data-factory-guy',

  // borrowed from ember-cli-pretender
  _findPretenderPaths: function() {
    if (!this._pretenderPath) {
      var resolve = require('resolve');

      this._pretenderPath = resolve.sync('pretender');
      this._pretenderDir = path.dirname(this._pretenderPath);
      this._routeRecognizerPath = resolve.sync('route-recognizer', { basedir: this._pretenderDir });
      this._fakeRequestPath = resolve.sync('fake-xml-http-request', { basedir: this._pretenderDir });
    }
  },

  // borrowed from ember-cli-pretender
  treeForVendor: function(tree) {
    this._findPretenderPaths();

    var pretenderTree = new Funnel(this._pretenderDir, {
      files: [path.basename(this._pretenderPath)],
      destDir: '/pretender',
    });

    var routeRecognizerFilename = path.basename(this._routeRecognizerPath);
    var routeRecognizerTree = new Funnel(path.dirname(this._routeRecognizerPath), {
      files: [routeRecognizerFilename, routeRecognizerFilename + '.map'],
      destDir: '/route-recognizer',
    });

    var fakeRequestTree = new Funnel(path.dirname(this._fakeRequestPath), {
      files: [path.basename(this._fakeRequestPath)],
      destDir: '/fake-xml-http-request',
    });

    var trees = [
      tree,
      pretenderTree,
      routeRecognizerTree,
      fakeRequestTree,
      // tree is not always defined, so filter out if empty
    ].filter(Boolean);

    return new MergeTrees(trees, {
      annotation: 'pretender-and-friends: treeForVendor'
    });
  },

  treeForApp: function(appTree) {
    var trees = [appTree];

    if (this.includeFactoryGuyFiles) {
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

    return MergeTrees(trees);
  },

  included: function(app) {
    this._super.included.apply(this, arguments);
    this.app = app;

    this.setupFactoryGuyInclude(app);

    if (this.includeFactoryGuyFiles) {
      this._findPretenderPaths();

      app.import('vendor/fake-xml-http-request/' + path.basename(this._fakeRequestPath));
      app.import('vendor/route-recognizer/' + path.basename(this._routeRecognizerPath));
      app.import('vendor/pretender/' + path.basename(this._pretenderPath));
      // not sure why this one is needed (but it is) borrowed it from mirage
      app.import('vendor/pretender-shim.js', {
        type: 'vendor',
        exports: { 'pretender': ['default'] }
      });
    }
  },

  setupFactoryGuyInclude: function(app) {
    let defaultEnabled = /test|development/.test(app.env);
    let defaultSettings = { enabled: defaultEnabled, useScenarios: false };
    let userSettings = app.project.config(app.env).factoryGuy || {};
    let settings = Object.assign(defaultSettings, userSettings);
    if (settings.useScenarios) {
      settings.enabled = true;
    }

    this.includeFactoryGuyFiles = settings.enabled;
    // Have to be carefull not to exclude factory guy from addon tree
    // in development or test env
    let trees = /test|development/.test(app.env) ? 'app' : 'app|addon';
    this.treeExcludeRegex = new RegExp(trees);
  },

  treeFor: function(name) {
    // Not sure why this is necessary, but this stops the factory guy files
    // from being added to app tree. Would have thought that this would have
    // happened in treeForApp above, but not the case
    if (!this.includeFactoryGuyFiles && this.treeExcludeRegex && this.treeExcludeRegex.test(name)) {
      return;
    }
    return this._super.treeFor.apply(this, arguments);
  }
};
