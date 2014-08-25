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


### Defining Factories
 - A factory has a name and a set of attributes.  
 - The name should match the model type name. So, for 'User' model, the name would be 'user' 
    

##### Standard models

```javascript

  FactoryGuy.define('user', {
    // Put default 'user' attributes in the default section
    default: {
      type: 'normal',
      name: 'Dude'
    },
    // Create a named 'user' with custom attributes
    admin: {
      type: 'super',
      name: 'Admin'
    }
  });

```


##### Polymorphic models

It is better to define each polymorphic model in it's own typed definition:

```
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

```
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
 - FactoryGuy.build   ... building json  
 - store.makeFixture  ... loading models into the store  
 - Can override default attributes by passing in a hash
 - Can add attributes with traits ( see traits section )  
 
```javascript
  
  // returns json   
  var json = FactoryGuy.build('user'); 
  json // => {id: 1, name: 'Dude', type: 'normal'}

  // returns a User instance that is loaded into your application's store   
  var user = store.makeFixture('user');
  user.toJSON() // => {id: 2, name: 'Dude', type: 'normal'}

  var json = FactoryGuy.build('admin'); 
  json // => {id: 3, name: 'Admin', type: 'super'}

  var user = store.makeFixture('admin');
  user.toJSON() // => {id: 4, name: 'Admin', type: 'super'}
  
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

  var user = store.makeFixture('user');
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
  json.title // => 'Project 1'

  var project = store.makeFixture('special_project');
  project.get('title') // => 'Project 2'

```

### Inline Functions

- Declare a function for an attribute 
  - Can reference other attributes

```  
   
  FactoryGuy.define('user', {
    // Assume that this definition includes the same sequences and default section
    // from the user definition in: "Declaring sequences in sequences hash" section. 
     
    funny_user: {
      type: function(f) { return 'funny '  + f.name }
    }
  });

  var json = FactoryGuy.build('funny_user');
  json.name = 'User1'
  json.type = 'funny User1'
  
  var user = store.makeFixture('funny_user');
  user.get('name') // => 'User2'
  user.get('type') // => 'funny User2'

```

*Note the type attribute was built from a function which depends on the name
 and the name is a generated attribute from a sequence function*


### Traits

- For grouping attributes together  
- Can use one or more traits in a row
 - The last trait included overrides any values in traits before it
 
```javascript

  FactoryGuy.define('user', {
    traits: {
      big: { name: 'Big Guy' }
      friendly: { type: 'Friendly' }
    }
  });
  
  var json = FactoryGuy.build('user', 'big', 'friendly'); 
  json.name // => 'Big Guy'
  json.type // => 'Friendly'

  var user = store.makeFixture('user', 'big', 'friendly');
  user.get('name') // => 'Big Guy'
  user.get('type') // => 'Friendly'

```

You can still pass in a hash of options when using traits. This hash of 
attributes will override any trait attributes or default attributes  
    
```javascript

  var user = store.makeFixture('user', 'big', 'friendly', {name: 'Dave'});
  user.get('name') // => 'Dave'
  user.get('type') // => 'Friendly'

```


### Associations

- Can setup belongsTo or hasMany associations in factory definitions
    - As inline attribute definition
    - With traits
- Can setup belongsTo or hasMany associations manually

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
    project_with_dude: {
      // create user model with custom attributes
      user: {name: 'Bob'}
    },
    project_with_admin: {
      // create a named user model with the FactoryGuy.belongsTo helper method
      user: FactoryGuy.belongsTo('admin')
    }
  });
  
  var json = FactoryGuy.build('project_with_user'); 
  json.user // => {id:1, name: 'Dude', type: 'Normal'}

  var json = FactoryGuy.build('project_with_dude'); 
  json.user // => {id:1, name: 'Dude', type: 'Normal'}

  var project = store.makeFixture('project_with_admin');
  project.get('user.name') // => 'Admin'
  project.get('user.type') // => 'super'

```

*You could also accomplish the above with traits:*

```javascript
  
  FactoryGuy.define('project', {
    traits: {
      with_user: { user: {} },
      with_admin: { user: FactoryGuy.belongsTo('admin') }
    }
  });
  
  var user = store.makeFixture('project', 'with_user');
  project.get('user').toJSON() // => {id:1, name: 'Dude', type: 'Normal'}
  
```


##### Setup belongsTo associations manually

```javascript
  var user = store.makeFixture('user');
  var project = store.makeFixture('project', {user: user});
    
  project.get('user').toJSON() // => {id:1, name: 'Dude', type: 'Normal'}
```

*Note that though you are setting the user belongsTo association on a project,
  the reverse user hasMany projects association is being setup on user as well*

```javascript
  user.get('projects.length') // => 1
```



##### Setup hasMany associations in Factory Definition

``` javascript
  FactoryGuy.define('user', {
    user_with_projects: { FactoryGuy.hasMany('project', 2) }
  });
  
  var user = store.makeFixture('user_with_projects');
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
  
  var user = store.makeFixture('user', 'with_projects');
  user.get('projects.length') // => 2
  
```

##### Setup hasMany associations manually

```
  var project1 = store.makeFixture('project');
  var project2 = store.makeFixture('project');
  var user = store.makeFixture('user', {projects: [project1,project2]});
  user.get('projects.length') // => 2
  
  // or  
  var projects = store.makeList('project', 2);
  var user = store.makeFixture('user', {projects: projects});
  user.get('projects.length') // => 2
  
```

*Note that though you are setting the projects hasMany association on a user,
  the reverse user belongsTo association is being setup on project as well*
   
```
  var projects = store.makeList('project', 2);
  var user = store.makeFixture('user', {projects: projects});
  // the projects all get the user they belongTo assigned to them
  user.get('projects.firstObject.user') // => user
```


#### Building many models at once

- FactoryGuy.buildList ... builds array of json
- store.makeList ... loads the array instance into store


##### Building json array 

```
  var json = FactoryGuy.buildList('user', 2) 
  json.length // => 2 
  json[0] // => {id: 1, name: 'User1', type: 'normal'}
  json[1] // => {id: 2, name: 'User2', type: 'normal'}

```

##### Building model instances

```
  var users = store.makeList('user', 2) 
  users.get('length') // => 2 
  users[0].toJSON() // => {id: 3, name: 'User3', type: 'normal'}
  json[1].toJSON() // => {id: 4, name: 'User4', type: 'normal'}

```


###Testing models, controllers, views 

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

// assuming your default adapter is ActiveModelAdapter or RESTAdapter
test("make a user using your applications default adapter", function() {
  var user = make('user');
  equal(store.all('user').get('content.length'), 1);
  equal(user instanceof DS.Model, true);
});


```


###Integration Tests


##### Using FactoryGuyTestMixin

- Uses mockjax
- Has helper methods
  - handleFind
  - handleCreate
  - handleUpdate
  - handleDelete

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


### Using DS.Fixture adapter

- Not recommended
- store.makeFixture ... creates model in the store and returns json

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
// you DON'T have to use the Fixture adapter.
store.find('user', 1).then(function(user) {
  user.toJSON() (pretty much equals) userJson;
  user.get('projects').then(function(projects) {
    projects.length == 1;
  });
});
