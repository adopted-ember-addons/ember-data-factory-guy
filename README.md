# Ember Data Factory Guy  [![Build Status](https://secure.travis-ci.org/danielspaniel/ember-data-factory-guy.png?branch=master)](http://travis-ci.org/danielspaniel/ember-data-factory-guy)

*NOTE*
  
ember-data is changing the way they are doing relationships in 1.0.0-beta.10 and above
so, if you are using ember-data-1.0.0-beta.8 and earlier, then be sure to use version 0.6.4
of ember-data-factory-guy.

- Versions:
  - 0.6.4   -> ember-data-1.0.0-beta.8 and under
  - 0.7.1.1 -> ember-data-1.0.0-beta.10
  - 0.8.6   -> ember-data-1.0.0-beta.11
  - 0.9.0   -> ember-data-1.0.0-beta.12

**Support for fixture adapter is currently kinda broken.**

*Version 0.9.0 expects you to no longer use store.makeFixture explicitly in your tests
but rather use the testHelper.make from FactoryGuyTestHelperMixin instead. If your not doing
this already, add a FactoryGuy.setStore(store) somewhere in your code before you start making fixtures.*


## Using with Ember Cli
  - https://github.com/igorrKurr/ember-cli-factory-guy-example
    An example of how to manually set up ember-data-factory-guy with ember cli 
  
  - https://github.com/cristinawithout/ember-cli-data-factory-guy
    A wrapper around ember-data-factory-guy for ember-cli for even easier setup

## Using as Gem

To Use with in Rails project or project with sprockets:

In Gemfile:

```ruby
gem 'ember-data-factory-guy', group: test
```

or for particular version:

```ruby
gem 'ember-data-factory-guy', '0.9.0', group: test
```

then:

```
$ bundle install
```

then:

require the 'ember_data_factory_guy' javascript file in your test helper

```
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

or for particular version:

```json
  "dependencies": {
    "foo-dependency": "latest",
    "other-foo-dependency": "latest",
    "ember-data-factory-guy": "0.9.0"
  }
```

then:
```
    $ bower install
```

### How this works

- Using DS.RestAdapter / DS.ActiveModelAdapter 
  - Add record instances to the store
  - Faster, since models can be accessed synchronously  
- Using DS.FixtureAdapter 
  - Add fixtures to the store
  - Slower, since models are accessed asynchronously
  

##### DS.RestAdapter / DS.ActiveModelAdapter

The preferred way to use this project is to use the default adapter for your project, 
which is usually going to be the RESTAdapter/ActiveModelAdapter.
*In other words, it is NOT recommended to use the DS.FixtureAdapter.*  

When you call: store.makeFixture('user'), you create model in the store and this method 
returns this model instance 

*Since you are synchronously getting model instances, you can immediately start asking
 for data from the model, and its associations, which is why it is faster to use
 the REST/ActiveModel adapter than the FixtureAdapter*

##### Using DS.FixtureAdapter
 
The benefit of using FactoryGuy is that you can run your tests with the
default adapter that your application's store normally uses. In other words:
You do not have to use the DS.FixtureAdapter.  But if you do choose to use the Fixture adapter,
which does not run any faster, and does not handle associations as elegantly
( and in some cases not at all ), you may run into problems with accessing associations.

Error: Assertion Failed: You looked up the 'projects' relationship on '<User:ember379:1>' but some of the associated records were not loaded. Either make sure they are all loaded together with the parent record, or specify that the relationship is async (`DS.hasMany({ async: true })`)

If you do get these types of errors try requiring the factory_guy_has_many.js file
( located in dist dir and vendor dir ) AFTER you require ember-data,
but BEFORE you require your models.  


### Setup 

In the following examples, assume the models look like this:

```javascript
  // standard models
  User = DS.Model.extend({
    name:     DS.attr('string'),
    style:    DS.attr('string'),
    projects: DS.hasMany('project'),
    hats: DS.hasMany('hat', {polymorphic: true})
  });

  Project = DS.Model.extend({
    title:  DS.attr('string'),
    user:   DS.belongsTo('user')
  });
  
  // polymorphic models 
  Hat = DS.Model.extend({
    type: DS.attr('string'),
    user: DS.belongsTo('user')
  });
  
  BigHat = Hat.extend();
  SmallHat = Hat.extend();
```


### Defining Factories
 - A factory has a name and a set of attributes.  
 - The name should match the model type name. So, for 'User' model, the name would be 'user' 
    

##### Standard models

```javascript

  FactoryGuy.define('user', {
    // Put default 'user' attributes in the default section
    default: {
      style: 'normal',
      name: 'Dude'
    },
    // Create a named 'user' with custom attributes
    admin: {
      style: 'super',
      name: 'Admin'
    }
  });

```


##### Polymorphic models

It is better to define each polymorphic model in it's own typed definition:

```javascript

  FactoryGuy.define('small_hat', {
    default: {
      type: 'SmallHat'
    }
  })
  
  FactoryGuy.define('big_hat', {
    default: {
      type: 'BigHat'
    }
  })

```

rather than doing this:

```javascript
  
  FactoryGuy.define('hat', {
    default: {},
    small_hat: {
      type: 'SmallHat'
    },
    big_hat: {
      type: 'BigHat'
    }
  })
  
```

Since there are times that the latter can cause problems when 
the store is looking up the correct model type name


### Using Factories
 - FactorGuy.setStore
   - pass in the store instance to FactoryGuy before making fixtures.
 - FactoryGuy.build
   - Builds json  
 - FactoryGuy.make
   - Loads model instance into the store  
 - Can override default attributes by passing in a hash
 - Can add attributes with traits ( see traits section )  
 
```javascript
  // First set the store on FactoryGuy. You don't have to do this step manually if you use
  // FactoryGuyTestHelperMixin since this is done for you in the setup method.
  var store = this.get('container').lookup('store:main');
  FactoryGuy.setStore(store);

  // returns json   
  var json = FactoryGuy.build('user'); 
  json // => {id: 1, name: 'Dude', style: 'normal'}

  // returns a User instance that is loaded into your application's store   
  var user = FactoryGuy.make('user');
  user.toJSON({includeId: true}) // => {id: 2, name: 'Dude', style: 'normal'}

  var json = FactoryGuy.build('admin'); 
  json // => {id: 3, name: 'Admin', style: 'super'}

  var user = FactoryGuy.make('admin');
  user.toJSON({includeId: true}) // => {id: 4, name: 'Admin', style: 'super'}
  
```

You can override the default attributes by passing in a hash 

```javascript
  
  var json = FactoryGuy.build('user', {name: 'Fred'}); 
  // json.name => 'Fred'
  
```


### Sequences

- For generating unique attribute values. 
- Can be defined: 
    - In the model definition's sequences hash 
    - Inline on the attribute 
- Values are generated by calling FactoryGuy.generate

##### Declaring sequences in sequences hash 

```javascript

  FactoryGuy.define('user', {
    sequences: {
      userName: function(num) {
        return 'User' + num;
      }
    },

    default: {
      // use the 'userName' sequence for this attribute
      name: FactoryGuy.generate('userName')
    }
  });

  var json = FactoryGuy.build('user'); 
  json.name // => 'User1'

  var user = FactoryGuy.make('user');
  user.get('name') // => 'User2'

```

##### Declaring an inline sequence on attribute 

```javascript

  FactoryGuy.define('project', {
    special_project: {
      title: FactoryGuy.generate(function(num) { return 'Project #' + num})
    },
  });

  var json = FactoryGuy.build('special_project'); 
  json.title // => 'Project #1'

  var project = FactoryGuy.make('special_project');
  project.get('title') // => 'Project #2'

```

### Inline Functions

- Declare a function for an attribute 
  - Can reference other attributes

```javascript 
   
  FactoryGuy.define('user', {
    // Assume that this definition includes the same sequences and default section
    // from the user definition in: "Declaring sequences in sequences hash" section. 
     
    funny_user: {
      style: function(f) { return 'funny '  + f.name }
    }
  });

  var json = FactoryGuy.build('funny_user');
  json.name // => 'User1'
  json.style // => 'funny User1'
  
  var user = FactoryGuy.make('funny_user');
  user.get('name') // => 'User2'
  user.get('style') // => 'funny User2'

```

*Note the style attribute was built from a function which depends on the name
 and the name is a generated attribute from a sequence function*


### Traits

- For grouping attributes together  
- Can use one or more traits in a row
 - The last trait included overrides any values in traits before it
 
```javascript

  FactoryGuy.define('user', {
    traits: {
      big: { name: 'Big Guy' }
      friendly: { style: 'Friendly' }
    }
  });
  
  var json = FactoryGuy.build('user', 'big', 'friendly'); 
  json.name // => 'Big Guy'
  json.style // => 'Friendly'

  var user = FactoryGuy.make('user', 'big', 'friendly');
  user.get('name') // => 'Big Guy'
  user.get('style') // => 'Friendly'

```

You can still pass in a hash of options when using traits. This hash of 
attributes will override any trait attributes or default attributes  
    
```javascript

  var user = FactoryGuy.make('user', 'big', 'friendly', {name: 'Dave'});
  user.get('name') // => 'Dave'
  user.get('style') // => 'Friendly'

```


### Associations

- Can setup belongsTo or hasMany associations in factory definitions
    - As inline attribute definition
    - With traits
- Can setup belongsTo or hasMany associations manually
- The inverse association is being set up for you

##### Setup belongsTo associations in Factory Definition
 
```javascript
  // Recall ( from above setup ) that there is a user belongsTo on the Project model
  // Also, assume 'user' factory is same as from 'user' factory definition above in
  // 'Defining Factories' section
  FactoryGuy.define('project', {

    project_with_user: {
      // create user model with default attributes
      user: {}
    },
    project_with_bob: {
      // create user model with custom attributes
      user: {name: 'Bob'}
    },
    project_with_admin: {
      // create a named user model with the FactoryGuy.belongsTo helper method
      user: FactoryGuy.belongsTo('admin')
    }
  });
  
  var json = FactoryGuy.build('project_with_user'); 
  json.user // => {id:1, name: 'Dude', style: 'normal'}

  var json = FactoryGuy.build('project_with_bob');
  json.user // => {id:1, name: 'Bob', style: 'normal'}

  var project = FactoryGuy.make('project_with_admin');
  project.get('user.name') // => 'Admin'
  project.get('user.style') // => 'super'

```

*You could also accomplish the above with traits:*

```javascript
  
  FactoryGuy.define('project', {
    traits: {
      with_user: { user: {} },
      with_admin: { user: FactoryGuy.belongsTo('admin') }
    }
  });
  
  var user = FactoryGuy.make('project', 'with_user');
  project.get('user').toJSON({includeId: true}) // => {id:1, name: 'Dude', style: 'normal'}
  
```


##### Setup belongsTo associations manually

```javascript
  var user = FactoryGuy.make('user');
  var project = FactoryGuy.make('project', {user: user});
    
  project.get('user').toJSON({includeId: true}) // => {id:1, name: 'Dude', style: 'normal'}
```

*Note that though you are setting the 'user' belongsTo association on a project,
the reverse user hasMany 'projects' association is being setup for you on the user 
( for both manual and factory defined belongsTo associations ) as well*

```javascript
  user.get('projects.length') // => 1
```



##### Setup hasMany associations in Factory Definition

``` javascript
  FactoryGuy.define('user', {
    user_with_projects: { FactoryGuy.hasMany('project', 2) }
  });
  
  var user = FactoryGuy.make('user_with_projects');
  user.get('projects.length') // => 2
  
```

*You could also accomplish the above with traits:*

```javascript
  
  FactoryGuy.define('project', {
    traits: {
      with_projects: {
        projects: FactoryGuy.hasMany('project', 2)
      }
    }
  });
  
  var user = FactoryGuy.make('user', 'with_projects');
  user.get('projects.length') // => 2
  
```

##### Setup hasMany associations manually

```javascript
  var project1 = FactoryGuy.make('project');
  var project2 = FactoryGuy.make('project');
  var user = FactoryGuy.make('user', {projects: [project1,project2]});
  user.get('projects.length') // => 2
  
  // or  
  var projects = store.makeList('project', 2);
  var user = FactoryGuy.make('user', {projects: projects});
  user.get('projects.length') // => 2
  
```

*Note that though you are setting the 'projects' hasMany association on a user,
the reverse 'user' belongsTo association is being setup for you on the project 
( for both manual and factory defined hasMany associations ) as well*
   
```javascript
  projects.get('firstObject.user')  // => user
```


#### Building many models at once

- FactoryGuy.buildList
    - Builds an array of one or more json objects
- store.makeList
    - Loads one or more instances into store


##### Building json array 

```javascript
  var json = FactoryGuy.buildList('user', 2) 
  json.length // => 2 
  json[0] // => {id: 1, name: 'User1', style: 'normal'}
  json[1] // => {id: 2, name: 'User2', style: 'normal'}

```

##### Building model instances

```javascript
  var users = store.makeList('user', 2) 
  users.get('length') // => 2 
  users[0].toJSON({includeId: true}) // => {id: 3, name: 'User3', style: 'normal'}
  users[1].toJSON({includeId: true}) // => {id: 4, name: 'User4', style: 'normal'}

```


### Testing models, controllers, views 

- Testing the models, controllers and views in isolation
- Use FactoryGuyTestMixin to help with testing


##### Using FactoryGuyTestMixin

- Using FactoryGuyTestMixin helper methods:
  - make
  - teardown
  
```javascript

// Create a helper class using FactoryGuyTestMixin.
TestHelper = Ember.Object.createWithMixins(FactoryGuyTestMixin);

// Then in your tests you can use it like so:

var testHelper, store, make;

module('User Model', {
  setup: function() {
    testHelper = TestHelper.setup(App);
    store = testHelper.getStore();
    // You could at this point, make fixtures with testHelper.make,
    // but to be even more concise try this shortcut method to your tests
    make = testHelper.make.bind(testHelper)
    // or if your running in phantomjs and it does not support bind method try this:
    // make = function() {return testHelper.make.apply(testHelper,arguments)}
  },
  teardown: function() {
    Em.run(function() { testHelper.teardown(); });
  }
});


// assuming your default adapter is ActiveModelAdapter or RESTAdapter
test("make a user using your applications default adapter", function() {
  var user = make('user');
  equal(store.all('user').get('content.length'), 1);
  equal(user instanceof DS.Model, true);
});


```


### Integration Tests


#### Using FactoryGuyTestMixin

- Uses mockjax
- Has helper methods
  - handleFindMany 
  - handleCreate 
  - handleUpdate 
  - handleDelete 

Since it is recommended to use your normal adapter ( which is usually a subclass of RESTAdapter, )
FactoryGuyTestMixin assumes you will want to use that adapter to do your integration tests.

To do that you will still have to deal with ember data trying to create, update or delete records.

If you put models into the store ( with store#makeFixture ), the http GET call does not need to be mocked,
since that model is already in the store.

But what if you want to handle create, update, and delete? Or even findAll records?

FactoryGuy assumes you want to mock ajax calls with the mockjax library,
and this is already bundled for you when you use the ember-data-factory-guy library.
                

##### handleFindMany
  - for dealing with finding all records of a particular type

```javascript
    // can use traits and extra fixture options here as you would with store#makeList
    testHelper.handleFindMany('profile', 2);
     
    store.find('profile').then(function (profiles) {
      profiles.get('length') //=> 2
    });
```

##### handleCreate
  - options
    - match - attributes that must be in request json
    - returns - attributes to include in response json
    - succeed - flag to indicate if the request should succeed ( default is true )

**Note**
 
  *Any attributes in match will be added to the response json automatically,
  so you don't need to include them in the returns hash as well.*
    
  *If you don't use match options for exact match, there will be no id returned to the model.*
     
  *If you match on a belongsTo association, you don't have to include that in the
  returns hash.*
  
  
Realistically, you will have code in a view action or controller action that will
 create the record, and setup any associations. 
 
```javascript
  
  // most actions that create a record look something like this:
  action: {
    addProject: function (user) {
      var name = this.$('.add-project input').val();
      var store = this.get('controller.store');
      store.createRecord('project', {name: name, user: user}).save();
    }
  }

```

In this case, you are are creating a 'project' record with a specific name, and belonging
to a particular user. To mock this createRecord call here are a few ways to do this using
match and or returns options.
  
```javascript
  // Simplest case  
  // Don't care about a match just handle createRecord for any project  
  testHelper.handleCreate('project')
  // Exactly matching attributes
  testHelper.handleCreate('project', {match: {name: "Moo", user: user}})
  // Exactly matching attributes, and returning extra attributes
  testHelper.handleCreate('project', {
    match: {name: "Moo", user: user}, returns: {created_at: new Date()}
  })

```

*mocking a failed create*

```javascript
  // set the succeed flag to 'false' 
  testHelper.handleCreate('project', {succeed: false});
  
  // when the createRecord on the 'project' is called, it will fail
  store.createRecord('project').save() //=> fails

  // or fail only if the attribues match exactly  
  testHelper.handleCreate('project', {
    match: {name: "Moo", user: user}, {succeed: false}
  })
  
  store.createRecord('project', {name: "Moo", user: user}).save() //=> fails
```



##### handleUpdate
  - handleUpdate(model)
  - handleUpdate(modelType, id)

*success case is the default*

```javascript
  var profile = FactoryGuy.make('profile');

  // Simplest way is to pass in the model that will be updated ( if you have it available )
  testHelper.handleUpdate(profile);

  // If the model is not available, pass in the modelType and the id ( if you know it )
  testHelper.handleUpdate('profile', 1);

  profile.set('description', 'good value');
  profile.save() //=> will succeed
````

*mocking a failed update*

```javascript
  var profile = FactoryGuy.make('profile');

  // set the succeed flag to 'false'
  testHelper.handleUpdate('profile', profile.id, false);
  // or
  testHelper.handleUpdate(profile, false);

  profile.set('description', 'bad value');
  profile.save() //=> will fail
````



##### handleDelete

*success case is the default*

```javascript
  var profile = FactoryGuy.make('profile');
  testHelper.handleDelete('profile', profile.id);

  profile.destroyRecord() // => will succeed
````

*mocking a failed delete*

```javascript
  var profile = FactoryGuy.make('profile');
  // set the succeed flag to 'false'
  testHelper.handleDelete('profile', profile.id, false);

  profile.destroyRecord() // => will fail
````


##### Integration test sample

```javascript

// create a view test helper using the FactoryGuyTestMixin
ViewTestHelper = Ember.Object.createWithMixins(FactoryGuyTestMixin,{
  // override setup to do a few extra things for view tests
  setup: function (app, opts) {
    app.reset();  // reset ember app before test
    $.mockjaxSettings.logging = false;   // mockjax settings
    $.mockjaxSettings.responseTime = 0;  // mockjax settings
    return this._super(app); // still call the base setup from FactoryGuyTestMixin
  }
}

var viewHelper, user;

module('User View', {
  setup: function() {
    viewHelper = ViewTestHelper.setup(App); // set up helper
    user = viewHelper.make('user'); // create a user in the store
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

    // Remember, this is for handling an exact match, if you did not care about
    // matching attributes, you could just do: viewHelper.handleCreate('project')
    viewHelper.handleCreate('project', {match:{name: newProjectName, user:user}})

    /**
     Let's say that clicking this '.add-project .link', triggers action in the view to
     create project record and looks something like this:

        actions: {
          addProject: function (user) {
            var name = this.$('.add-project input').val();
            var store = this.get('controller.store');
            store.createRecord('project', {name: name, user: user}).save();
          }

    */
    click('.add-project .link')

    var newProjectDiv = find('.project:contains('+newProjectName+')')
    equal(newProjectDiv[0] != undefined, true)
  })
})

```


### Using DS.Fixture adapter

- Not recommended
- FactoryGuy.make ... creates model in the store and returns json

Technically when you call FactoryGuy.make with a store using the DS.FixtureAdapter,
the fixture is actually added to the models FIXTURE array. It just seems to be added
to the store because when you call store.find to get that record, the adapter looks
in that FIXTURE array to find it and then puts it in the store.

```javascript


FactoryGuy.make('user'); // user.FIXTURES = [{id: 1, name: 'User1', style: 'normal'}]
FactoryGuy.make('user', {name: 'bob'}); //  user.FIXTURES = [{id: 2, name: 'bob', style: 'normal'}]
FactoryGuy.make('admin'); //  user.FIXTURES = [{id: 3, name: 'Admin', style: 'super'}]
FactoryGuy.make('admin', {name: 'Fred'}); //  user.FIXTURES = [{id: 4, name: 'Fred', style: 'super'}]


// Use store.find to get the model instance ( Remember this is the Fixture adapter, if
// you use the ActiveModelAdapter or RESTAdapter the record is returned so you don't
// have to then go and find it )
var userJson = FactoryGuy.make('user');
store.find('user', userJson.id).then(function(user) {
   user.toJSON({includeId: true}) ( pretty much equals ) userJson;
});

// and to setup associations ...
var projectJson = FactoryGuy.make('project');
var userJson = FactoryGuy.make('user', {projects: [projectJson.id]});
// OR
var userJson = FactoryGuy.make('user');
var projectJson = FactoryGuy.make('project', {user: userJson.id});

// will give you the same result, but with fixture adapter all associations
// are treated as async ( by factory_guy_has_many.js fix ), so it's
// a bit clunky to get this associated data. When using DS.FixtureAdapter
// in view specs though, this clunk is dealt with for you. But remember,
// you DON'T have to use the Fixture adapter.
store.find('user', 1).then(function(user) {
  user.toJSON({includeId: true}) (pretty much equals) userJson;
  user.get('projects').then(function(projects) {
    projects.length == 1;
  });
});
