var container;

module('DS.Store', {
  setup: function() {
    container = new Ember.Container();
  },
  teardown: function() {}
});


test("with DS.FixtureAdapter", function() {
  var store = createStore({adapter: DS.FixtureAdapter});
  equal(store.usingFixtureAdapter(), true );
});

test("when extending DS.FixtureAdapter", function() {
  var adapter = DS.FixtureAdapter.extend({});
  var store = createStore({adapter: adapter});
  equal(store.usingFixtureAdapter(), true );
});

test("with DS.RESTAdapter", function() {
  var store = createStore({adapter: DS.RESTAdapter});
  equal(store.usingFixtureAdapter(), false );
});

test("with DS.ActiveModelAdapter", function() {
  var store = createStore({adapter: DS.ActiveModelAdapter});
  equal(store.usingFixtureAdapter(), false );
});


