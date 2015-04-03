import Ember from 'ember';
import FactoryGuy from 'ember-data-factory-guy/factory-guy';
import startApp from '../helpers/start-app';

// adapterType like -rest or -active-model
export function theUsualSetup(adapterType) {
  var App = startApp();
  // brute force setting the adapter on the store.
  if (adapterType) {
    var adapter = App.__container__.lookup('adapter:'+adapterType);
    FactoryGuy.getStore().adapterFor = function() { return adapter; };
  }
  $.mockjaxSettings.logging = false;
  $.mockjaxSettings.responseTime = 0;
  return App;
}

export function theUsualTeardown(App) {
  Ember.run(function() {
    FactoryGuy.clearStore();
    App.destroy();
    $.mockjax.clear();
  });
}
