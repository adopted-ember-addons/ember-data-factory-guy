import { module } from 'qunit';
import FactoryGuy from 'ember-data-factory-guy';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

export default function (name, options = {}) {
  module(name, {
    beforeEach() {
      this.application = startApp();
      FactoryGuy.settings({ logLevel: 0 });
      if (options.beforeEach) {
        return options.beforeEach.apply(this, arguments);
      }
    },

    afterEach() {
      let afterEach =
        options.afterEach && options.afterEach.apply(this, arguments);
      return Promise.resolve(afterEach).then(() =>
        destroyApp(this.application)
      );
    },
  });
}
