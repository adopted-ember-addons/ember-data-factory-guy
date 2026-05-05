import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from 'test-app/config/environment';
import {
  macroCondition,
  dependencySatisfies,
  importSync,
} from '@embroider/macros';

// @warp-drive/ember/install is only available when using explicit WarpDrive packages
// (not the ember-data umbrella). It wires up Glimmer reactivity for WarpDrive.
if (macroCondition(dependencySatisfies('@warp-drive/ember', '*'))) {
  importSync('@warp-drive/ember/install');
}

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

loadInitializers(App, config.modulePrefix);
