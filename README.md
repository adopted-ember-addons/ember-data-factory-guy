# Ember Data Factory Guy

[![Build Status](https://secure.travis-ci.org/danielspaniel/ember-data-factory-guy.png?branch=master)](http://travis-ci.org/danielspaniel/ember-data-factory-guy) [![Ember Observer Score](http://emberobserver.com/badges/ember-data-factory-guy.svg)](http://emberobserver.com/addons/ember-data-factory-guy) [![npm version](https://badge.fury.io/js/ember-data-factory-guy.svg)](http://badge.fury.io/js/ember-data-factory-guy)

Feel the thrill and enjoyment of testing when using Factories instead of Fixtures.
Factories simplify the process of testing, making you more efficient and your tests more readable.


Contents:
  - [Installation](https://github.com/danielspaniel/ember-data-factory-guy#installation)
  - [How This Works](https://github.com/danielspaniel/ember-data-factory-guy#how-this-works)
  - [Setup](https://github.com/danielspaniel/ember-data-factory-guy#setup)
  - [Defining Factories](https://github.com/danielspaniel/ember-data-factory-guy#defining-factories)
  - [Using Factories](https://github.com/danielspaniel/ember-data-factory-guy#using-factories)
  - [Custom API formats](https://github.com/danielspaniel/ember-data-factory-guy#custom-api-formats)
  - [Sequences](https://github.com/danielspaniel/ember-data-factory-guy#sequences)
  - [Inline Function](https://github.com/danielspaniel/ember-data-factory-guy#inline-functions)
  - [Traits](https://github.com/danielspaniel/ember-data-factory-guy#traits)
  - [Associations](https://github.com/danielspaniel/ember-data-factory-guy#associations)
  - [Extending Other Definitions](https://github.com/danielspaniel/ember-data-factory-guy#extending-other-definitions)
  - [Callbacks](https://github.com/danielspaniel/ember-data-factory-guy#callbacks)
  - [Testing - creating scenarios](https://github.com/danielspaniel/ember-data-factory-guy#testing---creating-scenarios)
  - [Testing models, controllers, components](https://github.com/danielspaniel/ember-data-factory-guy#testing-models-controllers-components)
  - [Acceptance Tests](https://github.com/danielspaniel/ember-data-factory-guy#acceptance-tests)

ChangeLog: ( Notes about what has changed in each version )
  - [Release Notes](https://github.com/danielspaniel/ember-data-factory-guy/releases)

### Installation

##### Never used ember-data-factory-guy before

 - ```ember install ember-data-factory-guy@2.2.0``` ( ember-data-1.13.5+ )
 - ```ember install ember-data-factory-guy@1.13.2``` ( ember-data-1.13.0 + )
 - ```ember install ember-data-factory-guy@1.1.2``` ( ember-data-1.0.0-beta.19.1 )
 - ```ember install ember-data-factory-guy@1.0.10``` ( ember-data-1.0.0-beta.16.1 )


##### Have a previous installation ( updating to new version )

Clear npm:
 - remove 'ember-data-factory-guy' from package.json
 - ```npm prune ```

then:

 - Follow ["Never used ember-data-factory-guy before"](https://github.com/danielspaniel/ember-data-factory-guy#never-used-ember-data-factory-guy-before) instructions
 - Move existing factories to tests/factories directory

### How this works

  - You create factories for you models.
    - put them in tests/factories directory
  - Then you use them to create models in your tests.

[![Thumbnail of Introduction to ember-data-factory-guy](https://i.vimeocdn.com/video/545504017.png?mw=1920&mh=1080)](https://vimeo.com/album/3607049/video/146964694)

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

 - Define each polymorphic model in it's own typed definition
 - May want to extend parent factory here
   - See [Extending Other Definitions](https://github.com/danielspaniel/ember-data-factory-guy#extending-other-definitions)

```javascript

  // file tests/factories/small-hat.js
  import FactoryGuy from 'ember-data-factory-guy';

  FactoryGuy.define('small-hat', {
    default: {
      type: 'SmallHat'
    }
  })

  // file tests/factories/big-hat.js
  import FactoryGuy from 'ember-data-factory-guy';

  FactoryGuy.define('big-hat', {
    default: {
      type: 'BigHat'
    }
  })

```

In other words, don't do this:

```javascript
  // file tests/factories/hat.js
  import FactoryGuy from 'ember-data-factory-guy';

  FactoryGuy.define('hat', {
    default: {},
    small-hat: {
      type: 'SmallHat'
    },
    big-hat: {
      type: 'BigHat'
    }
  })

```


### Using Factories

 - FactoryGuy.make
   - Loads model instance into the store
 - FactoryGuy.makeList
   - Loads zero to many model instances into the store
 - FactoryGuy.build
   - Builds json in accordance with the adapters specifications
     - [RESTAdapter](http://guides.emberjs.com/v2.0.0/models/the-rest-adapter/#toc_json-conventions)  (*assume this adapter being used in most of the following examples*)
     - [ActiveModelAdapter](https://github.com/ember-data/active-model-adapter#json-structure)
     - [JSONAPIAdapter](http://jsonapi.org/format/)
 - FactoryGuy.buildList
   - Builds json with list of zero or more items in accordance with the adapters specifications
 - Can override default attributes by passing in an object of options
 - Can add attributes or relationships with [traits](https://github.com/danielspaniel/ember-data-factory-guy#traits)
 - Can compose relationships 
    - By passing in other objects you've made with build/buildList or make/makeList 

##### make/makeList
  - all instances loaded into the ember data store
  
```javascript

  import { make, makeList } from 'ember-data-factory-guy';
  
  // make basic user with the default attributes in user factory
  let user = make('user');
  user.toJSON({includeId: true}) // => {id: 1, name: 'User1', style: 'normal'}
  
  // make user with default attributes plus those defined as 'admin' in user factory
  let user = make('admin');
  user.toJSON({includeId: true}) // => {id: 2, name: 'Admin', style: 'super'}

  // make user with default attributes plus these extra attributes
  let user = make('user', {name: 'Fred'});
  user.toJSON({includeId: true}) // => {id: 3, name: 'Fred', style: 'normal'}

  // make admin defined user with these extra attributes
  let user = make('admin', {name: 'Fred'});
  user.toJSON({includeId: true}) // => {id: 4, name: 'Fred', style: 'super'}
  
  // make default user with traits and with extra attributes
  let user = make('user', 'silly', {name: 'Fred'});
  user.toJSON({includeId: true}) // => {id: 5, name: 'Fred', style: 'silly'}

  // make user with hats relationship ( hasMany ) composed of a few pre 'made' hats
  let hat1 = make('big-hat');
  let hat2 = make('big-hat');
  let user = make('user', {hats: [hat1, hat2]});
  user.toJSON({includeId: true})  
  // => {id: 6, name: 'User2', style: 'normal', hats: [{id:1, type:"big_hat"},{id:1, type:"big_hat"}]}
  // note that hats are polymorphic. if they weren't, the hats array would be a list of ids: [1,2]

  // make user with company relationship ( belongsTo ) composed of a pre 'made' company
  let company = make('company');
  let user = make('user', {company: company});
  user.toJSON({includeId: true})  // => {id: 7, name: 'User3', style: 'normal', company: 1} 

```


##### build/buildList
  - for building json that you can pass json payload in [acceptance tests](https://github.com/danielspaniel/ember-data-factory-guy#acceptance-tests)
  - to inspect the json use the get() method
  
```javascript
  
  import FactoryGuy, { build, buildList } from 'ember-data-factory-guy';  
  
  // build basic user with the default attributes in user factory
  let json = build('user');
  json.get() // => {id: 1, name: 'User1', style: 'normal'}

  // build user with default attributes plus those defined as 'admin' in user factory  
  let json = build('admin');
  json.get() // => {id: 2, name: 'Admin', style: 'super'}
  
  // build user with default attributes plus these extra attributes
  let json = build('user', {name: 'Fred'});
  json.get() // => {id: 3, name: 'Fred', style: 'normal'}

  // build admin defined user with extra attributes
  let json = build('admin', {name: 'Fred'});
  json.get() // => {id: 4, name: 'Fred', style: 'super'}

  // build default user with traits and with extra attributes
  let json = build('user', 'silly', {name: 'Fred'});
  json.get() // => {id: 5, name: 'Fred', style: 'silly'}

  // build user with hats relationship ( hasMany ) composed of a few pre 'built' hats 
  let hat1 = build('big-hat');
  let hat2 = build('big-hat');
  let json = build('user', {hats: [hat1, hat2]});
  // note that hats are polymorphic. if they weren't, the hats array would be a list of ids: [1,2]
  json.get() // => {id: 6, name: 'User2', style: 'normal', hats: [{id:1, type:"big_hat"},{id:1, type:"big_hat"}]}
  
  // build user with company relationship ( belongsTo ) composed of a pre 'built' company
  let company = build('company');
  let json = build('user', {company: company});
  json.get() // => {id: 7, name: 'User3', style: 'normal', company: 1} 
  
```

Example: what json looks like

*Although the RESTAdapter is being used, this works the same with ActiveModel or JSONAPI adapters*

```javascript

  let json = build('user', 'with_company', 'with_hats');
  json // =>
    {
      user: {
        id: 1,
        name: 'User1',
        company: 1,
        hats: [
          {type: 'big_hat', id:1},
          {type: 'big_hat', id:2}
        ]
      },
      companies: [
        {id: 1, name: 'Silly corp'}
      ],
      'big-hats': [
        {id: 1, type: "BigHat" },
        {id: 2, type: "BigHat" }
      ]
    }

```

##### using get() method
  - for inspecting contents of json payload
    - get() returns all attributes of top level model 
    - get(attribute) gives you attribute in top level model
    - get(index) gives you the info for hasMany relationship at that index
    - get(relationships) gives you just id or type ( if polymorphic )
      - better to compose the build relationships by hand if you need more info
    
```javascript

  let json = build('user', 'with_company', 'with_hats');
  json.get() //=> {id: 1, name: 'User1', style: 'normal'}
  // to get hats info
  json.get('hats') //=> [{id: 1, type: "big_hat"},{id: 1, type: "big_hat"}]
  // to get company info
  json.get('company') //=> {id: 1, type: "company"}

```

* by composing the relationships you can get the full attributes of those associations

```javascript

  let company = build('company');
  let hats = buildList('big-hats');
  let user = build('user', {company: company, hats: hats});
  user.get() //=> {id: 1, name: 'User1', style: 'normal'}
  // to get hats info from hats json 
  hats.get(0) //=> {id: 1, type: "BigHat", plus .. any other attributes}
  hats.get(1) //=> {id: 2, type: "BigHat", plus .. any other attributes}
  // to get company info
  company.get() //=> {id: 1, type: "Company", name: "Silly corp"}

```

### Custom API formats

FactoryGuy handles JSON-API and RESTSerializer out of the box.
In case your API doesn't follow either of these conventions, you can
still build a custom formatter.

Currently, a custom formatter __must__ implement the following interface:

* `extractId(modelName, payload)`: Tells FactoryGuy where to find the ID of your payload
* `convertForBuild(modelName, payload)`: Transforms a fixture into a JSON payload compatible with your API

```javascript
// tests/acceptance/my_test.js

import Ember from 'ember';
import FactoryGuy from 'ember-data-factory-guy/factory-guy';

const builderClass = Ember.Object.extend({
  extractId(modelName, payload) {
    return payload.id;
  },
  convertForBuild(/* type, payload */) {
    return { convert: 'build' };
  }
});

FactoryGuy.set('fixtureBuilder', builderClass.create());
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
      userName: (num)=> `User${num}`
    },

    default: {
      // use the 'userName' sequence for this attribute
      name: FactoryGuy.generate('userName')
    }
  });

  let json = FactoryGuy.build('user');
  json.get('name') // => 'User1'

  let user = FactoryGuy.make('user');
  user.get('name') // => 'User2'

```

##### Declaring an inline sequence on attribute

```javascript

  FactoryGuy.define('project', {
    special_project: {
      title: FactoryGuy.generate((num)=> `Project #${num}`)
    },
  });

  let json = FactoryGuy.build('special_project');
  json.get('title') // => 'Project #1'

  let project = FactoryGuy.make('special_project');
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
      style: (f)=> `funny ${f.name}`
    }
  });

  let json = FactoryGuy.build('funny_user');
  json.get('name') // => 'User1'
  json.get('style') // => 'funny User1'

  let user = FactoryGuy.make('funny_user');
  user.get('name') // => 'User2'
  user.get('style') // => 'funny User2'

```

*Note the style attribute was built from a function which depends on the name
 and the name is a generated attribute from a sequence function*


### Traits
- Used with build, buildList, make, or makeList
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

  let json = FactoryGuy.build('user', 'big', 'friendly');
  json.get('name') // => 'Big Guy'
  json.get('style') // => 'Friendly'

  let user = FactoryGuy.make('user', 'big', 'friendly');
  user.get('name') // => 'Big Guy'
  user.get('style') // => 'Friendly'

```

You can still pass in a hash of options when using traits. This hash of
attributes will override any trait attributes or default attributes

```javascript

  let user = FactoryGuy.make('user', 'big', 'friendly', {name: 'Dave'});
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

  let project = FactoryGuy.make('project_with_admin');
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

  let user = FactoryGuy.make('project', 'with_user');
  project.get('user').toJSON({includeId: true}) // => {id:1, name: 'Dude', style: 'normal'}

```


##### Setup belongsTo associations manually

```javascript
  let user = FactoryGuy.make('user');
  let project = FactoryGuy.make('project', {user: user});

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

  let user = FactoryGuy.make('user_with_projects');
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

  let user = FactoryGuy.make('user', 'with_projects');
  user.get('projects.length') // => 2

```

##### Setup hasMany associations manually

```javascript
  let project1 = FactoryGuy.make('project');
  let project2 = FactoryGuy.make('project');
  let user = FactoryGuy.make('user', {projects: [project1,project2]});
  user.get('projects.length') // => 2

  // or
  let projects = FactoryGuy.makeList('project', 2);
  let user = FactoryGuy.make('user', {projects: projects});
  user.get('projects.length') // => 2

```

*Note that though you are setting the 'projects' hasMany association on a user,
the reverse 'user' belongsTo association is being setup for you on the project
( for both manual and factory defined hasMany associations ) as well*

```javascript
  projects.get('firstObject.user')  // => user
```



### Extending Other Definitions
  - Extending another definition will inherit these sections:
    - sequences
    - traits
    - default attributes
  - Inheritance is fine grained, so in each section, any attribute that is local
    will take precedence over an inherited one. So you can override some
    attributes in the default section ( for example ), and inherit the rest

  - [Sample Factory using inheritance (big-group.js):](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/dummy/app/tests/factories/big-group.js)

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

    let property = FactoryGuy.make('property');
    property.get('name'); // => 'Silly property(FOR SALE)')

    let property = FactoryGuy.make('property', {for_sale: false});
    property.get('name'); // => 'Silly property')
  });

```

### Testing - Creating Scenarios
- Easy to create complex scenarios involving multi layered relationships.
  - Can use model instances to create relationships for making other models.
  
Example:

  - Setup a scenario where a user has two projects and belongs to a company

```javascript
   let company = make('company');
   let user = make('user', {company: company});
   let projects = makeList('project', 2, {user: user});
```

*You can use traits to help create the relationships as well, but this strategy allows you to
build up complex scenarios in a different way that has it's own benefits.*

####cacheOnlyMode
- FactoryGuy.cacheOnlyMode
 - allows you to setup the adapters to prevent them from fetching data with ajax call 
   - for single models ( find ) you have to put something in the store
   - for collections ( findAll ) you don't even have to put anything in the store.
 - takes except parameter as a list of models you don't want to cache. 
    these model requests will go to server with ajax call and need to be mocked.
   
This is helpful, when you want to set up the test data with make/makeList, and then prevent
calls like store.find or findAll from fetching more data, since you have already setup
the store with your custom scenario. 

  
### Testing models, controllers, components

- Testing the models, controllers and components

  - FactoryGuy needs to setup the factories before the test run.
    - use manualSetup function to set up FactoryGuy in unit/component tests

- [Sample model test (profile-test.js):](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/unit/models/profile-test.js)
  - Use 'moduleForModel' ( ember-qunit ), or describeModel ( ember-mocha ) test helper
  - manually set up Factory guy 

- [Sample component test #1 (dude-translator-manual-setup-test.js):](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/components/dude-translator-manual-setup-test.js)
  - Using 'moduleForComponent' ( ember-qunit ), or describeComponent ( ember-mocha ) helper
  - Manually sets up Factory guy ( so it's faster )

- [Sample component test #2 (dude-translator-test.js):](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/components/dude-translator-test.js)
  - Using 'moduleForComponent' ( ember-qunit ), or describeComponent ( ember-mocha ) helper
  - Starts a new application with startApp() before each test  ( slower )


```javascript

// Sample Unit Test for Profile Model => file: tests/unit/models/profile-test.js

import { manualSetup, make } from 'ember-data-factory-guy';
import { test, moduleForModel } from 'ember-qunit';

moduleForModel('profile', 'Unit | Model | profile', {
  needs: ['model:company', 'model:super-hero', 'model:group'],

  beforeEach: function() {
    manualSetup(this.container);
  }
});

test('using only make for profile with company association', function() {
  let profile = make('profile', 'with_company');
  ok(profile.get('company.profile') === profile);
});

test('using this.subject for profile and make for company associaion', function() {
  let profile = this.subject({company: make('company')});
  ok(profile.get('company.profile') === profile);
});

```


### Acceptance Tests

##### Using mock methods

- Uses mockjax
  - for mocking the ajax calls made by ember-data.
  - this library is installed with ember-data-factory-guy.
- http GET mocks
  - [mockFind](https://github.com/danielspaniel/ember-data-factory-guy#mockfind)
  - [mockFindAll](https://github.com/danielspaniel/ember-data-factory-guy#mockfindall)
  - [mockReload](https://github.com/danielspaniel/ember-data-factory-guy#mockreload)
  - [mockQuery](https://github.com/danielspaniel/ember-data-factory-guy#mockquery)
  - [mockQueryRecord](https://github.com/danielspaniel/ember-data-factory-guy#mockqueryrecord)
  - can pass custom headers to `returns()` method
    - the are cumulative so you can add as many as you like
    - Example: 
    ```javascript
      let mock = mockFindAll('user').returns({headers: {'X-Man': "Wolverine"}); 
      mock.returns({headers: {'X-Weapon': "Claws"}); 
    ```
  - these mocks are are reusable
    - so you can simulate making the same ajax call ( url ) and return a different payload
- http POST/PUT/DELETE
  - [mockCreate](https://github.com/danielspaniel/ember-data-factory-guy#mockcreate)
  - [mockUpdate](https://github.com/danielspaniel/ember-data-factory-guy#mockupdate)
  - [mockDelete](https://github.com/danielspaniel/ember-data-factory-guy#mockdelete)
- Can override FactoryGuyTestHelper by 'reopening' it ( if you need custom functionality.)


##### setup and teardown
  - Use ```mockSetup()``` in test setup/beforeEach 
  - Use ```mockTeardown()``` in test teardown/afterEach
  - Easiest is to set them up in [module-for-acceptance.js:](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/helpers/module-for-acceptance.js)

##### mockFind
  - For dealing with finding one record of a particular type
  - Can pass in arguments just like you would for make or build
  - Sample acceptance tests using mockFind: [user-view-test.js:](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/acceptance/user-view-test.js)
  
```javascript
   // Typically you will use like:
   import { build, mockFind } from 'ember-data-factory-guy';

   // To return default factory 'user'
   let mock = mockFind('user');
   let userId = mock.get('id');

   // or to return custom factory built json object using returns method
   let user1 = build('user', 'with_whacky_name', {isDude: true});
   let mock = mockFind('user').returns({ json: user1 });
   let userId = user1.get('id');

   // and to reuse the mock
   let user2 = build('user', {style: "boring"});
   mock.returns({ json: user2 });
   
   // To mock failure case use `fails` method
   mockFind('user').fails();

```

##### mockFindAll
  - For dealing with finding all records of a particular type
  - Sample acceptance tests using mockFindAll: [users-view-test.js](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/acceptance/users-view-test.js) 

Usage:

```javascript
   // Typically you will use like:
   import { buildList, mockFindAll } from 'ember-data-factory-guy';

   // To mock store.findAll but return no users
   let mock = mockFindAll('user');

   // To return custom factory built json object using returns method
   let users1 = buildList('user', 'with_whacky_name', {isDude: true});
   let mock = mockFindAll('user').returns({ json: users1 });

   // and to reuse the mock
   let users2 = buildList('user', 3);
   mock.returns({ json: user2 });
   
   // To mock failure case use `fails` method 
   mockFindAll('user').fails();

```


##### mockReload
  - To handle reloading a model
    - Pass in a record ( or a typeName and id )
    - Use fails to mock failure

*Passing in a record / model instance*

```javascript
    let profile = make('profile');
    mockReload(profile);

    // will stub a call to reload that profile
    profile.reload()
```

*Mocking a failed reload*

```javascript

    mockReload('profile', 1).fails();

```


##### mockQuery
   - For dealing with finding all records for a type of model with query parameters.
   - Takes modifier methods for controlling the response
    - withParams
    - returns( models / json / ids )

*Using plain mockQuery returns no results*

   ```js
     // This simulates a query that returns no results
     mockQuery('user', {age: 10});

     store.query('user', {age: 10}}).then(function(userInstances){
        /// userInstances will be empty
     })
   ```

*Use returnsModles by passing in array of model instances*

   ```js
     // Create model instances
     let users = FactoryGuy.makeList('user', 2, 'with_hats');

     // Pass in the array of model instances as last argument
     TestHelper.mockQuery('user', {name:'Bob', age: 10}).returnsModels(users);

     // will stub a call to the store like this:
     store.query('user', {name:'Bob', age: 10}}).then(function(models) {
        // models are the same as the users array
     });
   ```


*Use returnsJSON by passing in json*

   ```js
     // Create json with buildList
     let usersJSON = FactoryGuy.buildList('user', 2, 'with_hats');

     // use returnsJSON to pass in this response
     TestHelper.mockQuery('user', {name:'Bob', age: 10}).returnsJSON(usersJSON);

     store.query('user', {name:'Bob', age: 10}}).then(function(models) {
        // these models were created from the usersJSON
     });

   ```

*Use returnsExistingIds by passing in array of ids of existing models*

   ```js
     // Create list of models
     let users = FactoryGuy.makeList('user', 2, 'with_hats');
     let user1 = users.get('firstObject');

     // use returnsExistingIds to pass in the users ids you want
     // in this case let's say you only want to pass back the first user
     TestHelper.mockQuery('user', {name:'Bob', age: 10}).returnsExistingIds([user1.id]);

     store.query('user', {name:'Bob', age: 10}}).then(function(models) {
        // models will be one model and it will be user1
     });

   ```

*Reuse the handler to simulate the same query with different results*

   ```js

     let store = FactoryGuy.get('store');

     let bobQueryHander = TestHelper.mockQuery('user', {name: 'Bob'});

     store.query('user', {name: 'Bob'}).then(function (users) {
       //=> users.get('length') === 0;

       let bob = store.make('user', {name: 'Bob'});

       // reuse the same query handler since it's the same query
       bobQueryHander.returnsModels([bob]);

       store.query('user', {name: 'Bob'}).then(function (users) {
         //=> users.get('length') === 1;
         //=> users.get('firstObject') === bob;
       });
     });

```

*Reuse the handler to simulate different query params that returns different results*

   ```js

     let store = FactoryGuy.get('store');
     let bob = store.make('user', {name: 'Bob'});
     let dude = store.make('user', {name: 'Dude'});

     let userQueryHander = TestHelper.mockQuery('user', {name: 'Bob'}).returnsModels([bob]);

     store.query('user', {name: 'Bob'}).then(function (users) {
       //=> users.get('length') === 1;

       // reuse the same user query handler but change the expected query parms
       userQueryHander.withParams({name: 'Dude'}).returnsModels([dude]);

       store.query('user', {name: 'Dude'}).then(function (users) {
         //=> users.get('length') === 1;
         //=> users.get('firstObject') === dude;
       });
     });

```


##### mockCreate

  - Use chainable methods to build the response
    - match
      - Attributes that must be in request json
    - andReturns
      - Attributes to include in response json
    - fails
      - Request will fail
      - Takes a hash of options:
        - status - HTTP status code, defaults to 500.
        - response - error response message, or an errors hash for 422 status

  - Need to wrap tests using mockCreate with: Ember.run.function() { 'your test' })

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
      let name = this.$('button.project-name').val();
      let store = this.get('controller.store');
      store.createRecord('project', {name: name, user: user}).save();
    }
  }

```

In this case, you are are creating a 'project' record with a specific name, and belonging
to a particular user. To mock this createRecord call here are a few ways to do this using
chainable methods.


###### Using chainable methods

```javascript
  // Simplest case
  // Don't care about a match just handle createRecord for any project
  TestHelper.mockCreate('project');

  // Matching some attributes
  TestHelper.mockCreate('project').match({name: "Moo"});

  // Match all attributes
  TestHelper.mockCreate('project').match({name: "Moo", user: user});

  // Exactly matching attributes, and returning extra attributes
  TestHelper.mockCreate('project')
    .match({name: "Moo", user: user})
    .andReturn({created_at: new Date()});

```

*mocking a failed create*

```javascript

  // Mocking failure case is easy with chainable methods, just use #fails
  TestHelper.mockCreate('project').match({name: "Moo"}).fails();

  // Can optionally add a status code and/or errors to the response
  TestHelper.mockCreate('project').fails({status: 422, response: {errors: {name: ['Moo bad, Bahh better']}}});

  store.createRecord('project', {name: "Moo"}).save(); //=> fails
```


##### mockUpdate

  - mockUpdate(model)
    - Single argument ( the model instance that will be updated )
  - mockUpdate(modelType, id)
    - Two arguments: modelType ( like 'profile' ) , and the profile id that will updated
  - Use chainable methods to help build response:
    - fails
      - Request will fail
      - Optional arguments ( status and response text )
    - succeeds
      - Update should succeed, this is the default behavior
      - Can even use this after an ```fails``` call to simulate failure with
        invalid properties and then success after valid ones.
  - Need to wrap tests using mockUpdate with: Ember.run.function() { 'your test' })

*success case is the default*

```javascript
  let profile = FactoryGuy.make('profile');

  // Pass in the model that will be updated ( if you have it available )
  TestHelper.mockUpdate(profile);

  // If the model is not available, pass in the modelType and the id of
  // the model that will be updated
  TestHelper.mockUpdate('profile', 1);

  profile.set('description', 'good value');
  profile.save() //=> will succeed
````

*mocking a failed update*

```javascript
  let profile = FactoryGuy.make('profile');

  // set the succeed flag to 'false'
  TestHelper.mockUpdate('profile', profile.id).fails({status: 422, response: 'Invalid data'});
  // or
  TestHelper.mockUpdate(profile).fails({status: 422, response: 'Invalid data'});

  profile.set('description', 'bad value');
  profile.save() //=> will fail
````

*mocking a failed update and retry with succees*

```javascript
  let profile = FactoryGuy.make('profile');

  // set the succeed flag to 'false'
  let mockUpdate = TestHelper.mockUpdate('profile', profile.id);
  // or
  let mockUpdate = TestHelper.mockUpdate(profile);

  mockUpdate.fails({status: 422, response: 'Invalid data'});

  profile.set('description', 'bad value');
  profile.save() //=> will fail

  // After setting valid value
  profile.set('description', 'good value');

  // Now expecting success
  mockUpdate.succeeds();

  // Try that update again
  profile.save() //=> will succeed!
````



##### mockDelete
  - Need to wrap tests using mockDelete with: Ember.run.function() { 'your test' })

*success case is the default*

```javascript
  let profile = FactoryGuy.make('profile');
  TestHelper.mockDelete('profile', profile.id);

  profile.destroyRecord() // => will succeed
````

*mocking a failed delete*

```javascript
  let profile = FactoryGuy.make('profile');
  // set the succeed flag to 'false'
  TestHelper.mockDelete('profile', profile.id, false);

  profile.destroyRecord() // => will fail
````


##### Sample Acceptance test [(user-view-test.js):](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/acceptance/user-view-test.js)


```javascript
// file: tests/acceptance/user-view-test.js

import { make } from 'ember-data-factory-guy';
import fgHelper from 'ember-data-factory-guy/factory-guy-test-helper';
import moduleForAcceptance from '../helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | User View', {
  beforeEach: function () {
    // TestHelper.setup sets $.mockjaxSettings response time to zero ( speeds up tests )
    fgHelper.setup();
  },
  afterEach: function () {
      // TestHelper.teardown calls $.mockjax.clear() which resets all the mockjax handlers
    fgHelper.teardown();
  }
});

test("Creates new project", function () {
  let user = make('user', 'with_projects'); // create a user with projects in the store
  visit('/user/'+user.id);

  andThen(function () {
    let newProjectName = "Gonzo Project";

    fillIn('input.project-name', newProjectName);

    // Remember, this is for handling an exact match, if you did not care about
    // matching attributes, you could just do: TestHelper.mockCreate('project')
    fgHelper.mockCreate('project', {match: {name: newProjectName, user: user}});

    /**
     Let's say that clicking this 'button.add-project', triggers action in the view to
     create project record and looks something like this:
     actions: {
        addProject: function (user) {
          let name = this.$('input.project-name').val();
          let store = this.get('controller.store');
          store.createRecord('project', {name: name, user: user}).save();
        }
    */
    click('button:contains(Add New User)');

    andThen(function () {
      let newProjectDiv = find('li.project:contains(' + newProjectName + ')');
      ok(newProjectDiv[0] !== undefined);
    });
  });
});

```

