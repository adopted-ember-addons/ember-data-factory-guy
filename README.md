Ember Data Factory Guy [![Build Status](https://secure.travis-ci.org/danielspaniel/ember-data-factory-guy.png?branch=master)](http://travis-ci.org/danielspaniel/ember-data-factory-guy)
=================

# Using as Gem

To Use with in Rails project or project with sprockets:

In Gemfile:

```ruby
gem 'ember-data-factory-guy', group: test
```

then:

```
$ bundle install
```

then:

```javascript
// require the 'ember_data_factory_guy' javascript file in your test helper
//= require ember_data_factory_guy
```

# Using as bower component

Add as one of your dependencies in bower.json file:
```json
  "dependencies": {
    "foo-dependency": "latest",
    "other-foo-dependency": "latest",
    "ember-data-factory-guy": "latest"
  }
```

then:
```
$ bower install
```

# How this works

Add fixtures to the store using the:

  * DS.FixtureAdapter
  * DS.RestAdapter
  * DS.ActiveModelAdapter

NOTE: The benefit of using FactoryGuy is that you can run your tests with the
default adapter that your application's store normally uses. In other words:
You do not have to use the DS.FixtureAdapter.  But if you do choose to use the Fixture adapter,
which does not run any faster, and does not handle associations as elegantly
( and in some cases not at all ), you may run into problems with accessing associations.

Error: Assertion Failed: You looked up the 'projects' relationship on '<User:ember379:1>' but some of the associated records were not loaded. Either make sure they are all loaded together with the parent record, or specify that the relationship is async (`DS.hasMany({ async: true })`)

If you do get these types of errors try requiring the factory_guy_has_many.js file
( located in dist dir and vendor dir ) AFTER you require ember-data,
but BEFORE you require your models.


```javascript

  ////////////////////////////////////////////
  // Model definitions

  User = DS.Model.extend({
    name:     DS.attr('string'),
    type:     DS.attr('string'),
    projects: DS.hasMany('project')
  })

  Project = DS.Model.extend({
    title:  DS.attr('string')
    user:   DS.belongsTo('user')
  })

  ////////////////////////////////////////////
  // FactoryGuy definitions for models
  FactoryGuy.define('user', {
    // sequences to be used in attributes definition
    sequences: {
      userName: function(num) {
        return 'User' + num;
      }
   },

   // default 'user' attributes
    default: {
      type: 'normal',
      // use the 'userName' sequence for this attribute
      name: FactoryGuy.generate('userName')
    },

    // named 'user' type with custom attributes
    admin: {
      type: 'superuser',
      name: 'Admin'
    }
  });

  FactoryGuy.define('project', {
    default: {
      title: 'Project'
    }
  });

  //////////////////////////////////////////////////////////////////
  //            ** Make one fixture at time **
  // building json with FactoryGuy.build
  //

  var userJson = FactoryGuy.build('user') // {id: 1, name: 'User1', type: 'normal'}
  // note the sequence used in the name attribute
  var user2Json = FactoryGuy.build('user') // {id: 2, name: 'User2', type: 'normal'}
  var customUserJson = FactoryGuy.build('user', name: 'bob') // {id: 3, name: 'bob', type: 'normal'}
  var namedUserJson = FactoryGuy.build('admin') // {id: 4, name: 'Admin', type: 'superuser'}

  //////////////////////////////////////////////////////////////////
  //            ** Make a list of fixtures **
  // building json with FactoryGuy.buildList
  //

  var userJson = FactoryGuy.buildList('user',2) // [ {id: 1, name: 'User1', type: 'normal'}, {id: 2, name: 'User2', type: 'normal'} ]

  //////////////////////////////////////////////////////////////////
  //
  //  with store using =>    DS.Fixture adapter
  //
  //  store.makeFixture => creates model in the store and returns json
  //  store.makeList    => creates list of models in the store and returns json
  //

  store.makeFixture('user'); //  user.FIXTURES = [{id: 1, name: 'User1', type: 'normal'}]
  store.makeFixture('user', {name: 'bob'}); //  user.FIXTURES = [{id: 2, name: 'bob', type: 'normal'}]
  store.makeFixture('admin'); //  user.FIXTURES = [{id: 3, name: 'Admin', type: 'superuser'}]
  store.makeFixture('admin', {name: 'Fred'}); //  user.FIXTURES = [{id: 4, name: 'Fred', type: 'superuser'}]


  // Use store.find to get the model instance ( Remember this is the Fixture adapter, if
  // you use the ActiveModelAdapter or RESTAdapter the record is returned so you don't
  // have to then go and find it )
  var userJson = store.makeFixture('user');
  store.find('user', userJson.id).then(function(user) {
    user.toJSON() ( pretty much equals ) userJson;
  });

  // and to setup associations ...
  var projectJson = store.makeFixture('project');
  var userJson = store.makeFixture('user', projects: [projectJson.id]);
  // OR
  var userJson = store.makeFixture('user');
  var projectJson = store.makeFixture('project', user: userJson.id);

  // will give you the same result, but with fixture adapter all associations
  // are treated as async ( by factory_guy_has_many.js fix ), so it's
  // a bit clunky to get this associated data. When using DS.FixtureAdapter
  // in view specs though, this clunk is dealt with for you. But remember,
  // you don't have to use the Fixture adapter.
  store.find('user', 1).then(function(user) {
    user.toJSON() (pretty much equals) userJson;
    user.get('projects').then(function(projects) {
      projects.length == 1;
    });
  });

  // and for lists
  var users = store.makeList('user', 2, projects: [project.id]);

  //////////////////////////////////////////////////////////////////
  //
  //  with store using =>  DS.ActiveModelAdapter/DS.RestAdapter
  //
  //  store.makeFixture => creates model in the store and returns model instance
  //  store.makeList    => creates list of models in the store and returns model instance
  //
  //  *NOTE*  since you are now getting a model instances, you can synchronously
  //   start asking for data from the model
  //

  var user = store.makeFixture('user'); //  user.toJSON() = {id: 1, name: 'User1', type: 'normal'}
  // note that the user name is a sequence
  var user = store.makeFixture('user'); //  user.toJSON() = {id: 2, name: 'User2', type: 'normal'}
  var user = store.makeFixture('user', {name: 'bob'}); //  user.toJSON() = {id: 3, name: 'bob', type: 'normal'}
  var user = store.makeFixture('admin'); //  user.toJSON() = {id: 4, name: 'Admin', type: 'superuser'}
  var user = store.makeFixture('admin', {name: 'Fred'}); //  user.toJSON() = {id: 5, name: 'Fred', type: 'superuser'}

  // and to setup associations ...

  var project = store.makeFixture('project');
  var user = store.makeFixture('user', projects: [project]);
  //  OR
  var user = store.makeFixture('user');
  var project = store.makeFixture('project', user: user);

  // will get you the same results, since FactoryGuy makes sure the associates
  // are created in both directions
  user.get('projects.length') == 1;
  user.get('projects.firstObject.user') == user;

  // and to create lists ( of 3 users in this case )
  var users = store.makeList('user', 3);

```

Extra Goodies
=============

The code bundled in dist/ember-data-factory-guy.js includes a mixin named FactoryGuyTestMixin which
can be used in your tests to make it easier to access the store and make fixtures.

```javascript

// Let's say you have a helper for your tests named TestHelper declared in a file.

TestHelper = Ember.Object.createWithMixins(FactoryGuyTestMixin);


// Then in your tests you can use it like so:


var testHelper, store;

module('User Model', {
  setup: function() {
    testHelper = TestHelper.setup(App);
    store = testHelper.getStore();
  },
  teardown: function() {
    Em.run(function() { testHelper.teardown(); });
  }
});

// You could at this point, make fixtures with testHelper.make('user'), but
// to be even more concise in tests you could add this method to your tests
var make = function(name, opts) { return testHelper.make(name, opts); }


test("make a user using fixture adapter", function() {
  // useFixtureAdapter method is built into FactoryGuyTestMixin, and usually
  // this would be called in the setup function
  testHelper.useFixtureAdapter();
  var json = make('user');
  equal(User.FIXTURES.length, 1);
  equal(User.FIXTURES[0], json);
});

// assuming your default adapter is ActiveModelAdapter or RESTAdapter
test("make a user using your applications default adapter", function() {
  var user = make('user');
  equal(store.all('user').get('content.length'), 1);
  equal(user instanceof DS.Model, true);
});


```


Further Extra Goodies
=====================

Since it is recommended to use your normal adapter ( which is usually a subclass of RESTAdapter, )
FactoryGuyTestMixin assumes you will want to use that adapter to test your models or views.

To do that you will still have to deal with ember data trying to find, create, update or delete records.

If you put models in the store with FactoryGuy, the find will succeed and return the model.

But what if you want to handle create, update or delete?

Here is a sample of what you could do in a view test:

ViewTestHelper = Ember.Object.createWithMixins(FactoryGuyTestMixin,{

  setup: function (app, opts) {
    app.reset();
    $.mockjaxSettings.logging = false;
    $.mockjaxSettings.responseTime = 0;
    this._super(app);
    return this;
  }
}


var viewHelper, store;

module('User View', {
  setup: function() {
    viewHelper = ViewTestHelper.setup(App);
    var user = viewHelper.make('user);
    visit('/users/'+user.id);
  },
  teardown: function() {
    Em.run(function() { viewHelper.teardown(); });
  }
});

test("Creates new project", function() {
  andThen(function() {
    newProjectName  = "New User Name"

    click('.add-div div:contains(New Project)')
    fillIn('.add-project input', newProjectName)

    viewHelper.handleCreate('project', name: newProjectName)

    click('.add-project .link')

    projectLink = getProjectTreeElem(projectSelector(newProjectName))
    equal(projectLink[0] != undefined, true)
  })
})


