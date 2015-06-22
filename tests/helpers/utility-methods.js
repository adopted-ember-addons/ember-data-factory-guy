import Ember from 'ember';
import FactoryGuy from 'ember-data-factory-guy';
import startApp from '../helpers/start-app';

// adapterType like -rest or -active-model, -json-api
export function theUsualSetup(adapterType) {
  var App = startApp();
  // brute force setting the adapter on the store.
  if (adapterType) {
    //console.log('adapterType',adapterType)
    var adapter = App.__container__.lookup('adapter:'+adapterType);
    //console.log('adapter',adapter+'')
    FactoryGuy.getStore().adapterFor = function() {
      //console.log('using my adapt', adapter+'');
      return adapter; };
    var serializer = App.__container__.lookup('serializer:'+adapterType);
    //console.log('serializer',serializer+'')
    FactoryGuy.getStore().serializerFor = function() {
      //console.log('using my serial', serializer+'');
      return serializer; };
  }
  $.mockjaxSettings.logging = false;
  $.mockjaxSettings.responseTime = 0;
  return App;
}

export function theUsualTeardown(App) {
  Ember.run(function() {
    App.destroy();
    FactoryGuy.clearStore();
    $.mockjax.clear();
  });
}