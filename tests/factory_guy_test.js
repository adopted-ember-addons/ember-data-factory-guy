Person = DS.Model.extend({
  type: DS.attr('string'),
  name: DS.attr('string')
})

var testHelper, store;

module('FactoryGuy', {
  setup: function() {
    testHelper = TestHelper.setup(DS.FixtureAdapter);
    store = testHelper.getStore();
  },
  teardown: function() {
    Em.run(function() { testHelper.teardown(); });
  }
});


test("Using sequences in definitions", function() {
  FactoryGuy.define('person', {
    sequences: {
      personName: function(num) {
        return 'person #' + num;
      },
      personType: function(num) {
        return 'person type #' + num;
      }
    },
    default: {
      type: 'normal',
      name: FactoryGuy.generate('personName')
    },
    dude: {
      type: FactoryGuy.generate('personType')
    },
    bro: {
      type: FactoryGuy.generate('broType')
    }
  });

  var json = FactoryGuy.build('person');
  deepEqual(json, {id: 1, name: 'person #1', type: 'normal'}, 'in default attributes');

  var json = FactoryGuy.build('dude');
  deepEqual(json, {id: 2, name: 'person #2', type: 'person type #1'}, 'in named attributes');

  throws( function() {
    FactoryGuy.build('bro')
    }, MissingSequenceError,
    "throws error when sequence name not found"
  )
});


test("#build creates default json for model", function() {
  var json = FactoryGuy.build('user');
  deepEqual(json, {id: 1, name: 'User1'});
});


test("#build can override default model attributes", function() {
  var json = FactoryGuy.build('user',{name: 'bob'});
  deepEqual(json, {id: 1, name: 'bob'});
});


test("#build can have named model definition with custom attributes", function() {
  var json = FactoryGuy.build('admin')
  deepEqual(json, {id: 1, name: 'Admin'});
});


test("#build can override named model attributes", function() {
  var json = FactoryGuy.build('admin', {name: 'AdminGuy'})
  deepEqual(json, {id: 1, name: 'AdminGuy'});
});


test("#build similar model type ids are created sequentially", function() {
  var user1 = FactoryGuy.build('user');
  var user2 = FactoryGuy.build('user');
  var project = FactoryGuy.build('project');
  equal(user1.id, 1);
  equal(user2.id, 2);
  equal(project.id, 1);
});


test("#buildList creates list of fixtures", function() {
  var userList = FactoryGuy.buildList('user', 2);
  deepEqual(userList[0], {id: 1, name: 'User1'});
  deepEqual(userList[1], {id: 2, name: 'User1'});
});
