import Ember from 'ember';
import FactoryGuy from 'ember-data-factory-guy';
import startApp from '../helpers/start-app';

// adapterType like -rest or -active-model, -json-api
var theUsualSetup = function (adapterType) {
  var App = startApp();
  // brute force setting the adapter on the store.
  if (adapterType) {
    //console.log('adapterType',adapterType)
    var store = App.__container__.lookup('service:store');
    var adapter = App.__container__.lookup('adapter:'+adapterType);
    adapter.store = store;
    //console.log('adapter',adapter+'')
    FactoryGuy.getStore().adapterFor = function() {
      //console.log('using my adapt', adapter+'');
      return adapter; };
    var serializer = App.__container__.lookup('serializer:'+adapterType);
    serializer.store = store;
    if (adapterType === "-json-api") {
      // the json api serializer is dasherizing keys .. why?
      serializer.keyForAttribute = function (key, method) {
        return key;
      };
    }
    //console.log('serializer',serializer+'')
    FactoryGuy.getStore().serializerFor = function() {
      //console.log('using my serial', serializer+'');
      return serializer; };
  }
  $.mockjaxSettings.logging = false;
  $.mockjaxSettings.responseTime = 0;
  return App;
};

var theUsualTeardown = function (App) {
  Ember.run(function() {
    App.destroy();
    FactoryGuy.clearStore();
    $.mockjax.clear();
  });
};

var inlineSetup = function (App,adapterType) {
  return {
    beforeEach: function () {
      App = theUsualSetup(adapterType);
    },
    afterEach: function () {
      theUsualTeardown(App);
    }
  };
};

var title = function (adapter, testName) {
  return [adapter, testName].join(' ');
};

export { title, inlineSetup, theUsualSetup, theUsualTeardown };