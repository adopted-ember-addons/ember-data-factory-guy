var container;

module('DS.Store#usingFixtureAdapter', {
  setup: function() {
    container = new Ember.Container();
  },
  teardown: function() {}
});

var getStore = function(adapter) {
  container.register("store:main", DS.Store.extend({adapter: adapter}));
  return container.lookup("store:main");
}

test("with DS.FixtureAdapter", function() {
  var adapter = DS.FixtureAdapter
  equal(getStore(adapter).usingFixtureAdapter(), true );
});

test("when extending DS.FixtureAdapter", function() {
  var adapter = DS.FixtureAdapter.extend({});
  equal(getStore(adapter).usingFixtureAdapter(), true );
});

test("with DS.RESTAdapter", function() {
  var adapter = DS.RESTAdapter
  equal(getStore(adapter).usingFixtureAdapter(), false );
});

test("with DS.ActiveModelAdapter", function() {
  var adapter = DS.ActiveModelAdapter
  equal(getStore(adapter).usingFixtureAdapter(), false );
});


