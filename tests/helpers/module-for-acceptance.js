import { module } from 'qunit';
import startApp from './start-app';
import destroyApp from './destroy-app';
import {mockSetup, mockTeardown} from 'ember-data-factory-guy';

export default function(name, options = {}) {
  module(name, {
    beforeEach() {
      this.application = startApp();

      mockSetup();

      if (options.beforeEach) {
        options.beforeEach.apply(this, arguments);
      }
    },

    afterEach() {
      destroyApp(this.application);

      mockTeardown();

      if (options.afterEach) {
        options.afterEach.apply(this, arguments);
      }
    }
  });
}
