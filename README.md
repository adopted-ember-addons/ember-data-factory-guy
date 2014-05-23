# Ember Data Factory Guy [![Build Status](https://secure.travis-ci.org/danielspaniel/ember-data-factory-guy.png?branch=master)](http://travis-ci.org/danielspaniel/ember-data-factory-guy)

## Using as Gem

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

## Using as bower component

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

## How this works

Add fixtures to the store using the:

  * DS.RestAdapter
  * DS.ActiveModelAdapter
  * DS.FixtureAdapter

NOTE: The benefit of using FactoryGuy is that you can run your tests with the
default adapter that your application's store normally uses. In other words:
You do not have to use the DS.FixtureAdapter.  But if you do choose to use the Fixture adapter,
which does not run any faster, and does not handle associations as elegantly
( and in some cases not at all ), you may run into problems with accessing associations.

Error: Assertion Failed: You looked up the 'projects' relationship on '<User:ember379:1>' but some of the associated records were not loaded. Either make sure they are all loaded together with the parent record, or specify that the relationship is async (`DS.hasMany({ async: true })`)

If you do get these types of errors try requiring the factory_guy_has_many.js file
( located in dist dir and vendor dir ) AFTER you require ember-data,
but BEFORE you require your models.

Let's say you have a few models like these:

```javascript

  User = DS.Model.extend({
    name:     DS.attr('string'),
    type:     DS.attr('string'),
    projects: DS.hasMany('project'),
    hats: DS.hasMany('hat', {polymorphic: true})
  });

  Project = DS.Model.extend({
    title:  DS.attr('string'),
    user:   DS.belongsTo('user')
  });

  Hat = DS.Model.extend({
    type: DS.attr('string'),
    user: DS.belongsTo('user')
  });

  BigHat = Hat.extend();
  SmallHat = Hat.extend();

```


### Defining a Fixture Factory for a Model

```javascript
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
    // using a function for an attribute that refers to other attributes
    funny_user: {
      type: function(f) { return 'funny '  + f.name }
    }
  });

  FactoryGuy.define('project', {
    default: {
      title: 'Project'
    },
    //
    // define built in belongTo models
    //
    project_with_user: {
      // user model with default attributes
      user: {}
    },
    project_with_dude: {
      // user model with custom attributes
      user: {name: 'Dude'}
    },
    project_with_admin: {
      // for named association, use this FactoryGuy.association helper method
      user: FactoryGuy.association('admin')
    }
  });

  FactoryGuy.define('hat', {
    default: {},
    small_hat: {
      type: 'small_hat'
    },
    big_hat: {
      type: 'big_hat'
    }
  })
```


### Building Json

```javascript
  //////////////////////////////////////////////////////////////////
  //
  // building json with FactoryGuy.build
  //

  FactoryGuy.build('user') // {id: 1, name: 'User1', type: 'normal'}
  // note the sequence used in the name attribute
  FactoryGuy.build('user') // {id: 2, name: 'User2', type: 'normal'}
  FactoryGuy.build('user', {name: 'bob'}) // {id: 3, name: 'bob', type: 'normal'}
  FactoryGuy.build('admin') // {id: 4, name: 'Admin', type: 'superuser'}
  // note the type attribute was built from a function which depends on the name
  // and the name is still a generated attribute from a sequence function
  FactoryGuy.build('funny_user') // {id: 5, name: 'User3', type: 'funny User3'}

  // basic project
  FactoryGuy.build('project') // {id: 1, title: 'Project'}

  // project with a user
  FactoryGuy.build('project_with_user') // {id: 1, title: 'Project', user: {id:6, name: 'User4', type: 'normal'}
  // project with user that has custom attributes
  FactoryGuy.build('project_with_dude') // {id: 2, title: 'Project', user: {id:7, name: 'Dude', type: 'normal'}
  // project with user that has a named user
  FactoryGuy.build('project_with_admin') // {id: 3, title: 'Project', user: {id:8, name: 'Admin', type: 'superuser'}

  //////////////////////////////////////////////////////////////////
  //
  // building json with FactoryGuy.buildList
  //

  FactoryGuy.buildList('user', 2) // [ {id: 1, name: 'User1', type: 'normal'}, {id: 2, name: 'User2', type: 'normal'} ]
```


###Adding records to store

#####DS.ActiveModelAdapter/DS.RestAdapter

###### The Basics

store.makeFixture => creates model in the store and returns model instance
*NOTE* since you are getting a model instances, you can synchronously
start asking for data from the model, and its associations

```javascript
var user = store.makeFixture('user'); // user.toJSON() = {id: 1, name: 'User1', type: 'normal'}
// note that the user name is a sequence
var user = store.makeFixture('user'); // user.toJSON() = {id: 2, name: 'User2', type: 'normal'}
var user = store.makeFixture('funny_user'); // user.toJSON() = {id: 3, name: 'User3', type: 'funny User3'}
var user = store.makeFixture('user', {name: 'bob'}); // user.toJSON() = {id: 4, name: 'bob', type: 'normal'}
var user = store.makeFixture('admin'); // user.toJSON() = {id: 5, name: 'Admin', type: 'superuser'}
var user = store.makeFixture('admin', {name: 'Fred'}); // user.toJSON() = {id: 6, name: 'Fred', type: 'superuser'}
```

###### associations

``` javascript
var project = store.makeFixture('project');
var user = store.makeFixture('user', {projects: [project]});
//  OR
var user = store.makeFixture('user');
var project = store.makeFixture('project', {user: user});

// will get you the same results, since FactoryGuy makes sure the associations
// are created in both directions
// user.get('projects.length') == 1;
// user.get('projects.firstObject.user') == user;
```

###### polymorphic hasMany associations

```javascript
var sh = store.makeFixture('big_hat');
var bh = store.makeFixture('small_hat');
var user = store.makeFixture('user', {hats: [sh, bh]})
// user.get('hats.length') == 2;
// (user.get('hats.firstObject') instanceof BigHat) == true
// (user.get('hats.lastObject') instanceof SmallHat) == true
```

###### create lists

```javascript
var users = store.makeList('user', 3);
```

#####DS.Fixture adapter

store.makeFixture => creates model in the store and returns json

Technically when you call store.makeFixture with a store using the DS.FixtureAdapter,
the fixture is actually added to the models FIXTURE array. It just seems to be added
to the store because when you call store.find to get that record, the adapter looks
in that FIXTURE array to find it and then puts it in the store.

```javascript

store.makeFixture('user'); // user.FIXTURES = [{id: 1, name: 'User1', type: 'normal'}]
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
var userJson = store.makeFixture('user', {projects: [projectJson.id]});
// OR
var userJson = store.makeFixture('user');
var projectJson = store.makeFixture('project', {user: userJson.id});

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
store.makeList('user', 2, {projects: [project.id]});
```

###Testing models, controllers, views


This section assumes you are testing the ( controllers and views ) in isolation.

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


###Integration Tests

Since it is recommended to use your normal adapter ( which is usually a subclass of RESTAdapter, )
FactoryGuyTestMixin assumes you will want to use that adapter to do your integration tests.

To do that you will still have to deal with ember data trying to create, update or delete records.

If you put models into the store ( with store#makeFixture ), the http GET call does not need to be mocked,
since that model is already in the store.

But what if you want to handle create, update or delete?
FactoryGuy assumes you want to mock ajax calls with the mockjax library,
and you will need to download and include that library to use the following feature.

Here is a sample of what you could do in a view test:

```javascript

// create a view test helper using the FactoryGuyTestMixin
ViewTestHelper = Ember.Object.createWithMixins(FactoryGuyTestMixin,{
  // override setup to do a few extra things for view tests
  setup: function (app, opts) {
    app.reset();  // reset ember app before test
    $.mockjaxSettings.logging = false;   // mockjax settings
    $.mockjaxSettings.responseTime = 0;  // mockjax settings
    return this._super(app); // still call the base setup from FactoryGuyTestMixin
  },
  // override teardown to clear mockjax declarations
  teardown: function() {
    $.mockjaxClear();
    this._super();
  }
}

var viewHelper;

module('User View', {
  setup: function() {
    viewHelper = ViewTestHelper.setup(App); // set up helper
    var user = viewHelper.make('user'); // create a user in the store
    visit('/users/'+user.id); // visit the users route
  },
  teardown: function() {
    Em.run(function() { viewHelper.teardown(); });
  }
});

test("Creates new project", function() {
  andThen(function() {
    var newProjectName  = "Gonzo Project"

    click('.add-div div:contains(New Project)')
    fillIn('.add-project input', newProjectName)
    // This is the special sauce that makes this project really hum.
    // Check out the FactoryGuyTestMixin to see what is going on here
    viewHelper.handleCreate('project', {name: newProjectName})

    /**
     Let's say that clicking this '.add-project .link', triggers action in the view to
     create project record and looks something like this:

        actions: {
          addProject: function (user) {
            this.get('controller.store')
            .createRecord('project', {
              name: this.$('.add-project input').val(),
              user: user
            })
            .save()
          }

    */
    click('.add-project .link')

    var newProjectDiv = find('.project:contains('+newProjectName+')')
    equal(newProjectDiv[0] != undefined, true)
  })
})

```


