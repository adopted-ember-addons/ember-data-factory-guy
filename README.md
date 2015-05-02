# Ember Data Factory Guy  [![Build Status](https://secure.travis-ci.org/danielspaniel/ember-data-factory-guy.png?branch=master)](http://travis-ci.org/danielspaniel/ember-data-factory-guy)

Feel the thrill and enjoyment of testing when using Factories instead of Fixtures.
Factories simplify the process of testing, making you more efficient and your tests more readable.

*NOTE*

ember-data-factory-guy is now an ember-cli addon!

Contents: 
  - [Installation](https://github.com/danielspaniel/ember-data-factory-guy#installation)
  - [How This Works](https://github.com/danielspaniel/ember-data-factory-guy#how-this-works)
  - [Setup](https://github.com/danielspaniel/ember-data-factory-guy#setup)
  - [Defining Factories](https://github.com/danielspaniel/ember-data-factory-guy#defining-factories)
  - [Using Factories](https://github.com/danielspaniel/ember-data-factory-guy#using-factories)
  - [Sequences](https://github.com/danielspaniel/ember-data-factory-guy#sequences)
  - [Inline Function](https://github.com/danielspaniel/ember-data-factory-guy#inline-functions)
  - [Traits](https://github.com/danielspaniel/ember-data-factory-guy#traits)
  - [Associations](https://github.com/danielspaniel/ember-data-factory-guy#associations)
  - [Callbacks](https://github.com/danielspaniel/ember-data-factory-guy#callbacks)
  - [Testing models, controllers, components](https://github.com/danielspaniel/ember-data-factory-guy#testing-models-controllers-components)
  - [Integration/Acceptance Tests](https://github.com/danielspaniel/ember-data-factory-guy#integrationacceptance-tests)

### Installation

##### Never used ember-data-factory-guy before
 
 - ```ember install:addon ember-data-factory-guy```
 - ```ember install ember-data-factory-guy``` ( ember cli ^0.2.3 )

##### Have a previous installation as bower component or ember-cli-factory-guy

Clear bower:
 - remove ember-data-factory-guy from bower.json
 - ```bower prune ```

Clear npm:
 - remove 'ember-cli-data-factory-guy' or 'ember-data-factory-guy' from package.json
 - ```npm prune ```

then:
   
 - Follow ["Never used ember-data-factory-guy before"](https://github.com/danielspaniel/ember-data-factory-guy#never-used-ember-data-factory-guy-before) instructions
 - Move existing factories to tests/factories directory

### How this works

  - You create factories for you models.
    - put them in tests/factories directory
  - Then you use them to create models in your tests.

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
 - Create factory files in the tests/factories directory. 
  - Can use generator to create the outline of a factory file: 
  ```ember g factory user``` This will create a file named user.js in the tests/factories directory. 

  

##### Standard models

- [Sample full blown factory: (user.js)](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/dummy/app/tests/factories/user.js)

```javascript
  
  // file tests/factories/user.js
  import FactoryGuy from 'ember-data-factory-guy';
  
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
  
  // file tests/factories/small-hat.js
  import FactoryGuy from 'ember-data-factory-guy';
  
  FactoryGuy.define('small_hat', {
    default: {
      type: 'SmallHat'
    }
  })
  
  // file tests/factories/big-hat.js
  import FactoryGuy from 'ember-data-factory-guy';
  
  FactoryGuy.define('big_hat', {
    default: {
      type: 'BigHat'
    }
  })

```

rather than doing this:

```javascript
  // file tests/factories/hat.js  
  import FactoryGuy from 'ember-data-factory-guy';

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

 - FactoryGuy.make or just make
   - Loads model instance into the store
 - FactoryGuy.build or just build
   - Builds json
 - Can override default attributes by passing in a hash
 - Can add attributes with traits ( see traits section )

```javascript

  import FactoryGuy, { make, build } from 'ember-data-factory-guy';
  
  // returns json
  var json = FactoryGuy.build('user');
  json // => {id: 1, name: 'Dude', style: 'normal'}

  // returns a User instance that is loaded into your application's store
  var user = FactoryGuy.make('user');
  user.toJSON({includeId: true}) // => {id: 2, name: 'Dude', style: 'normal'}

  var json = build('admin');
  json // => {id: 3, name: 'Admin', style: 'super'}

  var user = make('admin');
  user.toJSON({includeId: true}) // => {id: 4, name: 'Admin', style: 'super'}

```

You can override the default attributes by passing in a hash

```javascript

  var json = build('user', {name: 'Fred'});
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
    user_with_projects: { projects: FactoryGuy.hasMany('project', 2) }
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
  var projects = FactoryGuy.makeList('project', 2);
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

- FactoryGuy.makeList
    - Loads one or more instances into store
- FactoryGuy.buildList
    - Builds an array of one or more json objects


##### Building json array

```javascript
  var json = FactoryGuy.buildList('user', 2)
  json.length // => 2
  json[0] // => {id: 1, name: 'User1', style: 'normal'}
  json[1] // => {id: 2, name: 'User2', style: 'normal'}

```

##### Building model instances

```javascript
  var users = FactoryGuy.makeList('user', 2)
  users.get('length') // => 2
  users[0].toJSON({includeId: true}) // => {id: 3, name: 'User3', style: 'normal'}
  users[1].toJSON({includeId: true}) // => {id: 4, name: 'User4', style: 'normal'}

```


### Callbacks
 - afterMake
  - Uses transient attributes 

Assuming the factory-guy model definition defines afterMake function:

```javascript
  FactoryGuy.define('property', {
    default: {
      name: 'Silly property'
    },
    
    // optionally set transient attributes, that will be passed in to afterMake function
    transient: {
      for_sale: true
    },
    
    // The attributes passed to after make will include any optional attributes you
    // passed in to make, and the transient attributes defined in this definition
    afterMake: function(model, attributes) {
      if (attributes.for_sale) {
        model.set('name', model.get('name') + '(FOR SALE)');
      }
    }
  }
```

You would use this to make models like:
  
```javascript
  Ember.run(function () {

    var property = FactoryGuy.make('property');
    property.get('name'); // => 'Silly property(FOR SALE)')

    var property = FactoryGuy.make('property', for_sale: false);
    property.get('name'); // => 'Silly property')
  });

```
                   
### Testing models, controllers, components

- Testing the models, controllers and components
  - FactoryGuy needs the application to startup in order to load the factories, and setup the store.
  - That is why all the tests import startApp function from 'tests/helpers/start-app.js' ( a file
    provided to you by ember cli )
- Using FactoryGuy shortcut methods:
  - make
- [Sample model test (user-test.js):](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/unit/models/user-test.js) 
  - Avoid using moduleForModel ( ember-qunit ), or describeModel ( ember-mocha ) test helper.
- [Sample component test (translate-test.js):](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/unit/components/translate-test.js)
  - Using 'moduleForComponent' because in it is easier in this case to get the component and render it with this 
    helper, but you are still starting up the application with startApp().

**Note** 
  
 *In the following model test, it's not necessary or helpful to use the ember-qunit moduleForModel
  helper, since the premise for that helper is to setup an isolated container with the minimal 
  requirements ( that model ) loaded.*
   
 *But, you need to startup the application ( for reasons stated above ), and if you have many relationships, 
  it's tedious to "needs: []" them all, to get them imported.
  Furthermore you don't want a model handed to you, you want to make your own, which is the whole
  point of factory guy.* 

```javascript

// file: tests/unit/models/user-test.js

import Ember from 'ember';
import { make } from 'ember-data-factory-guy';
import startApp from '../../helpers/start-app';

var App;

module('User', {
  beforeEach: function() {
    App = startApp();
  },
  afterEach: function() {
    Ember.run(App, 'destroy');
  }
});

test('it has projects', function() {
  var user = make('user', 'with_projects');
  equal(user.get('projects.length'), 2);
});


```


### Integration/Acceptance Tests

##### With FactoryGuyTestHelper

- Uses mockjax
- Has helper methods
  - handleFindAll
  - handleFind
  - handleFindQuery
  - handleCreate
  - handleUpdate
  - handleDelete
- Override FactoryGuyTestHelper by 'reopeing' it.

If you put models into the store ( with FactoryGuy#make ), the http GET call does not need to be mocked,
since that model is already in the store.

But what if you want to handle create, update, and delete? Or even reload or findAll records?

FactoryGuy assumes you want to stub ajax calls with the mockjax library,
and this javascript library is already bundled for you when you install ember-data-factory-guy.

##### handleFindAll
  - for dealing with finding all records of a particular type
  - [Sample acceptance test using handleFindAll (users-view-test.js):](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/acceptance/users-view-test.js)

If when visiting a route, some part of your application ( like router, or 
controller action ) is going to make a call to the store for all records of 
a particular type:  
   
```javascript
  store.find('user') // fires ajax request for all user records 
```

An Integration test ( to stub that ajax call and return factory guy data ) 
will look like this:
   
```javascript
  visit('/users');
  
  // can use traits and extra fixture options here as you would with FactoryGuy#makeList    
  TestHelper.handleFindAll('user', 2);
      
  andThen(function () {
    var users = find('li.user');
    ok(users.length === 2);
  });
```

 
##### handleFind
  - pass in a record to handle reload
  - pass in fixture name and options ( including id if needed ) to handle making a record
    with those options and finding that record

*Passing in a model instance*

```javascript
    var profile = FactoryGuy.make('profile')
    // Using handleFind   
    TestHelper.handleFind(profile);

    // will stub a call to reload that profile
    profile.reload()
```

*Passing in fixture name and options*

```javascript
    // can use traits and extra fixture options here as you would with FactoryGuy#make,
    // since a record will be made, and placed in the store for you.
    TestHelper.handleFind('profile', {id: 1});

    // will stub a call to the store like this:
    store.find('profile', 1);
    
```


##### handleFindQuery
   - for dealing with finding all records for a type of model with query parameters.
     - can pass in model instances or empty array


*Passing in array of model instances*

   ```js
     // Create model instances
     var users = FactoryGuy.makeList('user', 2, 'with_hats');

     // Pass in the array of model instances as last argument
     TestHelper.handleFindQuery('user', ['name', 'age'], users);
     
     // will stub a call to the store like this:
     store.findQuery('user', {name:'Bob', age: 10}});
   ```

*Passing in nothing for last argument*

   ```js
     // This simulates a query that returns no results
     TestHelper.handleFindQuery('user', ['age']);

     store.findQuery('user', {age: 10000}}).then(function(userInstances){
        /// userInstances will be empty
     })
   ```


##### handleCreate
  - Use chainable methods to build the response
    - match - attributes that must be in request json
    - andReturns - attributes to include in response json
    - andFail - request should fail
      - Takes a hash of options:
        - status - HTTP status code, defaults to 500.
        - response - error response message, or an errors hash for 422 status

  - need to wrap tests using handleCreate with: Ember.run.function() { 'your test' })

**Note**

  *Any attributes in match will be added to the response json automatically,
  so you don't need to include them in the returns hash as well.*

  *If you match on a belongsTo association, you don't have to include that in the
  returns hash.*


Realistically, you will have code in a view action or controller action that will
 create the record, and setup any associations.

```javascript

  // most actions that create a record look something like this:
  action: {
    addProject: function (user) {
      var name = this.$('button.project-name').val();
      var store = this.get('controller.store');
      store.createRecord('project', {name: name, user: user}).save();
    }
  }

```

In this case, you are are creating a 'project' record with a specific name, and belonging
to a particular user. To mock this createRecord call here are a few ways to do this using
chainable methods, or options hash.


###### Using chainable methods

```javascript
  // Simplest case
  // Don't care about a match just handle createRecord for any project
  TestHelper.handleCreate('project')

  // Matching some attributes
  TestHelper.handleCreate('project').match({match: {name: "Moo"})

  // Match all attributes
  TestHelper.handleCreate('project').match({match: {name: "Moo", user: user})

  // Exactly matching attributes, and returning extra attributes
  TestHelper.handleCreate('project')
    .match({name: "Moo", user: user})
    .andReturn({created_at: new Date()})

```

*mocking a failed create*

```javascript

  // Mocking failure case is easy with chainable methods, just use #andFail
  TestHelper.handleCreate('project').match({match: {name: "Moo"}).andFail()

  // Can optionally add a status code and/or errors to the response
  TestHelper.handleCreate('project').andFail({status: 422, response: {errors: {name: ['Moo bad, Bahh better']}}});

  store.createRecord('project', {name: "Moo"}).save() //=> fails
```


##### handleUpdate

  - Use chainable methods to help build response:
    - andFail 
      - request should fail, use options argument to pass status and response text
    - andSucceed 
      - update should succeed, this is the default behavior
      - can even use this after an ```andFail``` call to simulate failure with
        invalid properties and then success after valid ones.
  - handleUpdate(model)
    - single argument ( the model instance that will be updated )
  - handleUpdate(modelType, id)
    - two arguments: modelType ( like 'profile' ) , and the profile id that will updated 
  - need to wrap tests using handleUpdate with: Ember.run.function() { 'your test' })

*success case is the default*

```javascript
  var profile = FactoryGuy.make('profile');

  // Pass in the model that will be updated ( if you have it available )
  TestHelper.handleUpdate(profile);

  // If the model is not available, pass in the modelType and the id of
  // the model that will be updated
  TestHelper.handleUpdate('profile', 1);

  profile.set('description', 'good value');
  profile.save() //=> will succeed
````

*mocking a failed update*

```javascript
  var profile = FactoryGuy.make('profile');

  // set the succeed flag to 'false'
  TestHelper.handleUpdate('profile', profile.id).andFail({status: 422, response: "{error: 'Invalid data'}"});
  // or
  TestHelper.handleUpdate(profile).andFail({status: 422, response: "{error: 'Invalid data'}"});

  profile.set('description', 'bad value');
  profile.save() //=> will fail
````

*mocking a failed update and retry with succees*

```javascript
  var profile = FactoryGuy.make('profile');

  // set the succeed flag to 'false'
  var mockUpdate = TestHelper.handleUpdate('profile', profile.id);
  // or
  var mockUpdate = TestHelper.handleUpdate(profile);

  mockUpdate.andFail({status: 422, response: "{error: 'Invalid data'}"});

  profile.set('description', 'bad value');
  profile.save() //=> will fail

  // Some logic for retrying...

  mockUpdate.andSucceed();
  profile.save() //=> will succeed!
````



##### handleDelete
  - need to wrap tests using handleDelete with: Ember.run.function() { 'your test' })

*success case is the default*

```javascript
  var profile = FactoryGuy.make('profile');
  TestHelper.handleDelete('profile', profile.id);

  profile.destroyRecord() // => will succeed
````

*mocking a failed delete*

```javascript
  var profile = FactoryGuy.make('profile');
  // set the succeed flag to 'false'
  TestHelper.handleDelete('profile', profile.id, false);

  profile.destroyRecord() // => will fail
````


##### Sample Integration/Acceptance test

- [Sample acceptance test (user-view-test.js):](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/acceptance/user-view-test.js)


```javascript
// file: tests/acceptance/user-view-test.js

import Ember from 'ember';

import { make } from 'ember-data-factory-guy';
import TestHelper from 'ember-data-factory-guy/factory-guy-test-helper';

import startApp from '../helpers/start-app';

var App;

module('User View', {
  setup: function () {
    Ember.run(function () {
      App = startApp();
      TestHelper.setup(); 
    });
  },
  teardown: function () {
    Ember.run(function () {
      TestHelper.teardown();
      App.destroy();
    });
  }
});


test("Creates new project", function () {
  var user = make('user', 'with_projects'); // create a user with projects in the store
  visit('/user/1');

  andThen(function () {
    var newProjectName = "Gonzo Project";

    fillIn('input.project-name', newProjectName);

    // Remember, this is for handling an exact match, if you did not care about
    // matching attributes, you could just do: TestHelper.handleCreate('project')
    TestHelper.handleCreate('project', {match: {name: newProjectName, user: user}});

    /**
     Let's say that clicking this 'button.add-project', triggers action in the view to
     create project record and looks something like this:
     actions: {
        addProject: function (user) {
          var name = this.$('input.project-name').val();
          var store = this.get('controller.store');
          store.createRecord('project', {name: name, user: user}).save();
        }
    */
    click('button:contains(Add New User)');

    andThen(function () {
      var newProjectDiv = find('li.project:contains(' + newProjectName + ')');
      ok(newProjectDiv[0] !== undefined);
    });
  });
});

```

