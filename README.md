# Ember Data Factory Guy

[![Build Status](https://secure.travis-ci.org/danielspaniel/ember-data-factory-guy.png?branch=master)](http://travis-ci.org/danielspaniel/ember-data-factory-guy) [![Ember Observer Score](http://emberobserver.com/badges/ember-data-factory-guy.svg)](http://emberobserver.com/addons/ember-data-factory-guy) [![npm version](https://badge.fury.io/js/ember-data-factory-guy.svg)](http://badge.fury.io/js/ember-data-factory-guy)

Feel the thrill and enjoyment of testing when using Factories instead of Fixtures.
Factories simplify the process of testing, making you more efficient and your tests more readable.

**NEW and Improved** starting with v2.7.0
  - Support for using your factories in development environment
  - Change your [scenarios](#using-in-other-environments), hit refresh and the development data changes

**Older but still fun things**
- Support for **[ember-data-model-fragment](https://github.com/lytics/ember-data-model-fragments)** usage is baked in since v2.5.0
- Support for **[ember-django-adapter](https://github.com/dustinfarris/ember-django-adapter)** usage is fried in since v2.6.1
- Support for adding [meta data](#using-add-method) to payloads for use with **ember-infinity** ie. => pagination
- Support for adding headers to payloads

**Why is FactoryGuy so awesome**
- Since you're using ember data, you don't need to create any ORM like things
- You don't need to add any files to recreate the relationships in your models
- Any custom methods like: serialize / serializeAttribute in a serializer will be used automatically
- If you set up custom methods like: buildURL / urlForFindRecord in an adapter, they will be used automatically
- You don't have to setup anything besides making your factories
- Everything just works

### Questions / Get in Touch
Visit the EmberJS Community [#e-factory-guy](https://embercommunity.slack.com/messages/e-factory-guy/) Slack channel

### Contents
  - [How It Works](#how-it-works)
  - [Installation](#installation)
  - [Upgrading](#upgrading)
  - [Setup](#setup)
  - [Defining Factories](#defining-factories)
  - [Using Factories](#using-factories)
  - [Using in Development, Production or other environments](#using-in-other-environments)
  - [Ember Data Model Fragments](#ember-data-model-fragments)
  - [Creating Factories in Addons](#creating-factories-in-addons)
  - [Ember Django Adapter](#ember-django-adapter)
  - [Custom API formats](#custom-api-formats)
  - [Testing models, controllers, components](#testing-models-controllers-components)
  - [Acceptance Tests](#acceptance-tests)
  - [Tips and Tricks](#tips-and-tricks)
  - [Changelog](#changelog)

### How it works
  - You create factories for you models.
    - put them in the `tests/factories` directory
  - Use these factories to create models for your tests
    - you can make records that persist in the store
    - or you can build a json payload used for mocking an ajax call's payload

### Installation

 - ```ember install ember-data-factory-guy``` ( ember-data-1.13.5+ )
 - ```ember install ember-data-factory-guy@1.13.2``` ( ember-data-1.13.0 + )
 - ```ember install ember-data-factory-guy@1.1.2``` ( ember-data-1.0.0-beta.19.1 )
 - ```ember install ember-data-factory-guy@1.0.10``` ( ember-data-1.0.0-beta.16.1 )

### Upgrading

 -  remove ember-data-factory-guy from `package.json`
 - ```npm prune```
 - ```ember install ember-data-factory-guy```  ( for the latest release )

### Setup

In the following examples, assume the models look like this:

```javascript
  // standard models
  User = DS.Model.extend({
    name:     DS.attr('string'),
    style:    DS.attr('string'),
    projects: DS.hasMany('project'),
    hats:     DS.hasMany('hat', {polymorphic: true})
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
 - The name should match the model type name. So, for the model `User`, the factory name would be `user`
 - Create factory files in the `tests/factories` directory.
 - Can use generators to create the outline of a factory file:
  ```ember generate factory user``` This will create a factory in a file named `user.js` in the `tests/factories` directory.


#### Standard models

- Sample full blown factory: [`user.js`](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/dummy/app/tests/factories/user.js)

- Brief sample of a factory definition:
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

- If you are using an attribute named `type` and this is not a polymorphic model, use the option
  ```polymorphic: false``` in your definition
```javascript
// file: tests/factories/cat.js
FactoryGuy.define('cat', {
  polymorphic: false, // manually flag this model as NOT polymorphic
  default: {
    // usually, an attribute named 'type' is for polymorphic models, but the defenition
    // is set as NOT polymorphic, which allows this type to work as attibute
    type: 'Cute',
    name: (f)=> `Cat ${f.id}`
  }
});
```

#### Polymorphic models

 - Define each polymorphic model in its own typed definition
 - The attribute named `type` is used to hold the model name
 - May want to extend the parent factory here (see [extending other definitions](iel/ember-data-factory-guy#extending-other-definitions))

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

#### Sequences

- For generating unique attribute values.
- Can be defined:
    - In the model definition's `sequences` hash
    - Inline on the attribute
- Values are generated by calling `FactoryGuy.generate`

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

  let first = FactoryGuy.build('user');
  first.get('name') // => 'User1'

  let second = FactoryGuy.make('user');
  second.get('name') // => 'User2'

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
  - The fixture is passed as parameter so you can reference
  all other attributes, even id


```javascript

  FactoryGuy.define('user', {
    default: {
      // Don't need the userName sequence, since the id is almost
      // always a sequential number, and you can use that.
      // f is the fixture being built as the moment for this factory
      // definition, which has the id available
      name: (f)=> `User${f.id}`
    },
    traits: {
      boring: {
        style: (f)=> `${f.id} boring`
      }
      funny: {
        style: (f)=> `funny ${f.name}`
      }
    }
  });

  let json = FactoryGuy.build('user', 'funny');
  json.get('name') // => 'User1'
  json.get('style') // => 'funny User1'

  let user = FactoryGuy.make('user', 'boring');
  user.get('id') // => 2
  user.get('style') // => '2 boring'

```

*Note the style attribute was built from a function which depends on the name
 and the name is a generated attribute from a sequence function*


### Traits
- Used with `FactoryGuy.build`, `FactoryGuy.buildList`, `FactoryGuy.make`, or `FactoryGuy.makeList`
- For grouping attributes together
- Can use one or more traits
 - Each trait overrides any values defined in traits before it in the argument list

```javascript

  FactoryGuy.define('user', {
    traits: {
      big: { name: 'Big Guy' },
      friendly: { style: 'Friendly' },
      bfg: { name: 'Big Friendly Giant', style: 'Friendly' }
    }
  });

  let user = FactoryGuy.make('user', 'big', 'friendly');
  user.get('name') // => 'Big Guy'
  user.get('style') // => 'Friendly'

  let giant = FactoryGuy.make('user', 'big', 'bfg');
  user.get('name') // => 'Big Friendly Giant' - name defined in the 'bfg' trait overrides the name defined in the 'big' trait
  user.get('style') // => 'Friendly'


```

You can still pass in a hash of options when using traits. This hash of
attributes will override any trait attributes or default attributes

```javascript

  let user = FactoryGuy.make('user', 'big', 'friendly', {name: 'Dave'});
  user.get('name') // => 'Dave'
  user.get('style') // => 'Friendly'

```


#### Associations

- Can setup belongsTo or hasMany associations in factory definitions
    - As inline attribute definition
    - With traits
- Can setup belongsTo or hasMany associations manually
  - With `FactoryGuy.build`/`FactoryGuy.buildList` and `FactoryGuy.make`/`FactoryGuy.makeList`
    - Can compose relationships to any level

##### Setup belongsTo associations in Factory Definitions

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
See `FactoryGuy.build`/`FactoryGuy.buildList` for more ideas

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

##### Setup hasMany associations in the Factory Definition

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
See `FactoryGuy.build`/`FactoryGuy.makeList` for more ideas

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

There is a sample Factory using inheritance here: [`big-group.js`](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/dummy/app/tests/factories/big-group.js)


### Transient Attributes
  - Use transient attributes to build a fixture
    - Pass in any attribute you like to build a fixture
    - Usually helps you to build some other attribute
    - These attributes will be removed when fixture is done building
  - Can be used in `FactoryGuy.make`/`FactoryGuy.makeList`/`FactoryGuy.build`/`FactoryGuy.buildList`

Let's say you have a model and a factory like this:

```javascript

  // app/models/dog.js
  import Model from 'ember-data/model';
  import attr from 'ember-data/attr';

  export default Model.extend({
    dogNumber: attr('string'),
    sound: attr('string')
  });

  // tests/factories/dog.js
  import FactoryGuy from 'ember-data-factory-guy';

  const defaultVolume = "Normal";

  FactoryGuy.define('dog', {
    default: {
      dogNumber: (f)=> `Dog${f.id}`,
      sound: (f) => `${f.volume||defaultVolume} Woof`
    },
  });
```

Then to build the fixture:

```javascript
  let dog2 = build('dog', { volume: 'Soft' });

  dog2.get('sound'); //=> `Soft Woof`
```


### Callbacks 
  - `afterMake` ( Going to be deprecated soon )
  - Uses transient attributes
  - Unfortunately the model will fire 'onload' event before this `afterMake` is called.
    - So all data will not be setup by then if you rely on `afterMake` to finish by the
     time `onload` is called.
    - In this case, just use transient attributes without the `afterMake`
    - Probably will remove `afterMake` soon due to this issue
      
Assuming the factory-guy model definition defines `afterMake` function:

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

### Using Factories

 - [`FactoryGuy.make`](#factoryguymake)
   - Loads a model instance into the store
 - [`FactoryGuy.makeNew`](#factoryguymakenew)
   - Create a new model instance but doesn't load it to the store
 - [`FactoryGuy.makeList`](#factoryguymakelist)
   - Loads zero to many model instances into the store
 - [`FactoryGuy.build`](#factoryguybuild)
   - Builds json in accordance with the adapter's specifications
     - [RESTAdapter](http://emberjs.com/api/data/classes/DS.RESTAdapter.html)  (*assume this adapter being used in most of the following examples*)
     - [ActiveModelAdapter](https://github.com/ember-data/active-model-adapter#json-structure)
     - [JSONAPIAdapter](http://jsonapi.org/format/)
     - [DrfAdapter (Ember Django Adapter)](https://github.com/dustinfarris/ember-django-adapter)
 - [`FactoryGuy.buildList`](#factoryguybuildlist)
   - Builds json with a list of zero or more items in accordance with the adapter's specifications
 - Can override default attributes by passing in an object of options
 - Can add attributes or relationships with [traits](#traits)
 - Can compose relationships
    - By passing in other objects you've made with `build`/`buildList` or `make`/`makeList`

##### `FactoryGuy.make`
```javascript

  import { make } from 'ember-data-factory-guy';

  // make a user with the default attributes in user factory
  let user = make('user');
  user.toJSON({includeId: true}); // => {id: 1, name: 'User1', style: 'normal'}

  // make a user with the default attributes plus those defined as 'admin' in the user factory
  let user = make('admin');
  user.toJSON({includeId: true}); // => {id: 2, name: 'Admin', style: 'super'}

  // make a user with the default attributes plus these extra attributes provided in the optional hash
  let user = make('user', {name: 'Fred'});
  user.toJSON({includeId: true}); // => {id: 3, name: 'Fred', style: 'normal'}

  // make an 'admin' user with these extra attributes
  let user = make('admin', {name: 'Fred'});
  user.toJSON({includeId: true}); // => {id: 4, name: 'Fred', style: 'super'}

  // make a user with a trait ('silly') plus these extra attributes provided in the optional hash
  let user = make('user', 'silly', {name: 'Fred'});
  user.toJSON({includeId: true}); // => {id: 5, name: 'Fred', style: 'silly'}

  // make a user with a hats relationship ( hasMany ) composed of pre-made hats
  let hat1 = make('big-hat');
  let hat2 = make('big-hat');
  let user = make('user', {hats: [hat1, hat2]});
  user.toJSON({includeId: true})
  // => {id: 6, name: 'User2', style: 'normal', hats: [{id:1, type:"big_hat"},{id:1, type:"big_hat"}]}
  // note that hats are polymorphic. if they weren't, the hats array would be a list of ids: [1,2]

  // make a user with a company relationship ( belongsTo ) composed of a pre-made company
  let company = make('company');
  let user = make('user', {company: company});
  user.toJSON({includeId: true})  // => {id: 7, name: 'User3', style: 'normal', company: 1}

```

##### `FactoryGuy.makeNew`
  - Same api as `FactoryGuy.make`
    - except that the model will not be loaded into store

##### `FactoryGuy.makeList`
  - check out [(user factory):](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/dummy/app/tests/factories/user.js) to see 'bob' user and 'with_car' trait

Usage:

```javascript

  import { make, makeList } from 'ember-data-factory-guy';

  // Let's say bob is a named type in the user factory
  makeList('user', 'bob') // makes 0 bob's

  makeList('user', 'bob', 2) // makes 2 bob's

  makeList('user', 'bob', 2, 'with_car', {name: "Dude"})
  // makes 2 bob users with the 'with_car' trait and name of "Dude"
  // In other words, applies the traits and options to every bob made

  makeList('user', 'bob', 'with_car', ['with_car', {name: "Dude"}])
  // makes 2 users with bob attributes. The first also has the 'with_car' trait and the
  // second has the 'with_car' trait and name of "Dude", so you get 2 different users


```
##### `FactoryGuy.build`
  - for building json that you can pass as json payload in [acceptance tests](#acceptance-tests)
  - takes the same arguments as `FactoryGuy.make`
  - can compose relationships with other `FactoryGuy.build`/`FactoryGuy.buildList` payloads
  - to inspect the json use the `get` method
  - use the [`add`](#using-add-method) method
    - to include extra sideloaded data to the payload
    - to include meta data

Usage:

```javascript

  import { build, buildList } from 'ember-data-factory-guy';

  // build a basic user with the default attributes from the user factory
  let json = build('user');
  json.get() // => {id: 1, name: 'User1', style: 'normal'}

  // build a user with the default attributes plus those defined as 'admin' in the user factory
  let json = build('admin');
  json.get() // => {id: 2, name: 'Admin', style: 'super'}

  // build a user with the default attributes with extra attributes
  let json = build('user', {name: 'Fred'});
  json.get() // => {id: 3, name: 'Fred', style: 'normal'}

  // build the admin defined user with extra attributes
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

  // build and compose relationships to unlimited degree
  let company1 = build('company', {name: 'A Corp'});
  let company2 = build('company', {name: 'B Corp'});
  let owners = buildList('user', { company:company1 }, { company:company2 });
  let buildJson = build('property', { owners });

```
- Example of what json payload from build looks like
 - Although the RESTAdapter is being used, this works the same with ActiveModel or JSONAPI adapters

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

##### `FactoryGuy.buildList`
  - for building json that you can pass as json payload in [acceptance tests](#acceptance-tests)
  - takes the same arguments as `FactoryGuy.makeList`
  - can compose relationships with other `build`/`buildList` payloads
  - to inspect the json use the `get()` method
    - can use `get(index)` to get an individual item from the list
  - use the [`add`](#using-add-method) method
    - to add extra sideloaded data to the payload => `.add({json})`
    - to add meta data => `.add({meta})`

Usage:

```javascript
  import { build, buildList } from 'ember-data-factory-guy';

  let bobs = buildList('bob', 2);  // builds 2 Bob's

  let bobs = buildList('bob', 2, {name: 'Rob'); // builds 2 Bob's with name of 'Rob'

  // builds 2 users, one with name 'Bob' , the next with name 'Rob'
  let users = buildList('user', { name:'Bob' }, { name:'Rob' });

  // builds 2 users, one with 'boblike' and the next with name 'adminlike' features
  // NOTE: you don't say how many to make, because each trait is making new user
  let users = buildList('user', 'boblike', 'adminlike');

  // builds 2 users:
  // one 'boblike' with stoner style
  // and the next 'adminlike' with square style
  // NOTE: how you are grouping traits and attributes for each one by wrapping them in array
  let users = buildList('user', ['boblike', { style: 'stoner' }], ['adminlike', {style: 'square'}]);
```

##### Using `add()` method
 - when you need to add more json to payload
  - will be sideloaded
    - only JSONAPI, and REST based serializers can do sideloading
    - so DRFSerializer and JSONSerializer users can not use this feature

Usage:

```javascript
  let batMan = build('bat_man');
  let userPayload = build('user').add({ json: batMan });

  userPayload = {
    user: {
      id: 1,
      name: 'User1',
      style: "normal"
    },
    'super-heros': [
      {
        id: 1,
        name: "BatMan",
        type: "SuperHero"
      }
    ]
  };
```
- when you want to add meta data to payload
  - only JSONAPI, and REST based and serializers and DRFSerializer can handle meta data
  - so JSONSerializer users can not use this feature ( though this might be a bug on my part )

Usage:

```javascript
  let json1 = buildList('profile', 2).add({ meta: { previous: '/profiles?page=1', next: '/profiles?page=3' } });
  let json2 = buildList('profile', 2).add({ meta: { previous: '/profiles?page=2', next: '/profiles?page=4' } });

  mockQuery('profile', {page: 2}).returns({ json: json1 });
  mockQuery('profile', {page: 3}).returns({ json: json2 });

 store.query('profile', {page: 2}).then((records)=> // first 2 from json1
 store.query('profile', {page: 3}).then((records)=> // second 2 from json2

```

##### Using `get()` method
  - for inspecting contents of json payload
    - `get()` returns all attributes of top level model
    - `get(attribute)` gives you an attribute from the top level model
    - `get(index)` gives you the info for a hasMany relationship at that index
    - `get(relationships)` gives you just the id or type ( if polymorphic )
      - better to compose the build relationships by hand if you need more info
  - check out [user factory:](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/dummy/app/tests/factories/user.js) to see 'boblike' and 'adminlike' user traits

```javascript
  let json = build('user');
  json.get() //=> {id: 1, name: 'User1', style: 'normal'}
  json.get('id') // => 1

  let json = buildList('user', 2);
  json.get(0) //=> {id: 1, name: 'User1', style: 'normal'}
  json.get(1) //=> {id: 2, name: 'User2', style: 'normal'}

  let json = buildList('user', 'boblike', 'adminlike');
  json.get(0) //=> {id: 1, name: 'Bob', style: 'boblike'}
  json.get(1) //=> {id: 2, name: 'Admin', style: 'super'}
```

* building relationships inline

```javascript

  let json = build('user', 'with_company', 'with_hats');
  json.get() //=> {id: 1, name: 'User1', style: 'normal'}

  // to get hats (hasMany relationship) info
  json.get('hats') //=> [{id: 1, type: "big_hat"},{id: 1, type: "big_hat"}]

  // to get company ( belongsTo relationship ) info
  json.get('company') //=> {id: 1, type: "company"}

```

* by composing the relationships you can get the full attributes of those associations

```javascript

  let company = build('company');
  let hats = buildList('big-hats');

  let user = build('user', {company , hats});
  user.get() //=> {id: 1, name: 'User1', style: 'normal'}

  // to get hats info from hats json
  hats.get(0) //=> {id: 1, type: "BigHat", plus .. any other attributes}
  hats.get(1) //=> {id: 2, type: "BigHat", plus .. any other attributes}

  // to get company info
  company.get() //=> {id: 1, type: "Company", name: "Silly corp"}

```

### Using in Other Environments

- You can set up scenarios for your app that use all your factories from tests updating `config/environment.js`.

- NOTE: Do not use settings in the `test` environment. Factories are enabled
  by default for the `test` environment and setting the flag tells factory-guy to load the app/scenarios
  files which are not needed for using factory-guy in testing. This will result in errors being generated if
  the app/scenarios files do not exist.
  
  ```javascript
    // file: config/environment.js
    // in development you don't have to set enabled to true since that is default
    if (environment === 'development') {
      ENV.factoryGuy = { useScenarios: true }; 
      ENV.locationType = 'auto';
      ENV.rootURL = '/';
    }

    // or

    if (environment === 'production') {
      ENV.factoryGuy = {enabled: true, useScenarios: true};
      ENV.locationType = 'auto';
      ENV.rootURL = '/';
    }

    ```
- Place your scenarios in the `app/scenarios` directory
  - Start by creating at least a `scenarios/main.js` file since this is the starting point
  - Your scenario classes should inherit from `Scenario` class
  - A scenario class should declare a run method where you do things like:
    - include other scenarios
      - you can compose scenarios like a symphony of notes
    - make your data or mock your requests using the typical Factory Guy methods
      - these methods are all built into scenario classes so you don't have to import them

  ```javascript
    // file: app/scenarios/main.js
    import {Scenario} from 'ember-data-factory-guy';
    import Users from './users';

    // Just for fun, set the log level ( to 1 ) and see all FactoryGuy response info in console
    Scenario.settings({
      logLevel: 1, // 1 is the max for now, default is 0
    });

    export default class extends Scenario {
      run() {
         this.include([Users]);   // include other scenarios
         this.mockFindAll('products', 3);  // mock some finds
      }
    }
  ```

  ```javascript
    // file: app/scenarios/users.js
    import {Scenario} from 'ember-data-factory-guy';

    export default class extends Scenario {
      run() {
        this.mockFindAll('user', 'boblike', 'normal');
        this.mockDelete('user');
      }
    }
  ```


### Ember Data Model Fragments
As of 2.5.2 you can create factories which contain [ember-data-model-fragments](https://github.com/lytics/ember-data-model-fragments). Setting up your fragments is easy and follows the same process as setting up regular factories. The mapping between fragment types and their associations are like so:

Fragment Type | Association
--- | ---
`fragment` | `FactoryGuy.belongsTo`
`fragmentArray` | `FactoryGuy.hasMany`
`array` | `[]`

For example, say we have the following `Employee` model which makes use of the `fragment`, `fragmentArray` and `array` fragment types.

```javascript
// Employee model
export default Model.extend({
  name: fragment('name'),
  phoneNumbers: fragmentArray('phone-number')
})

// Name fragment
export default Fragment.extend({
  titles: array('string'),
  firstName: attr('string'),
  lastName: attr('string')
});

// Phone Number fragment
export default Fragment.extend({
  number: attr('string')
  type: attr('string')
});
```

A factory for this model and its fragments would look like so:

```javascript
// Employee factory
FactoryGuy.define('employee', {
  default: {
    name: FactoryGuy.belongsTo('name'), //fragment
    phoneNumbers: FactoryGuy.hasMany('phone-number') //fragmentArray
  }
});

// Name fragment factory
FactoryGuy.define('name', {
  default: {
    titles: ['Mr.', 'Dr.'], //array
    firstName: 'Jon',
    lastName: 'Snow'
  }
});

// Phone number fragment factory
FactoryGuy.define('phone-number', {
  default: {
    number: '123-456-789',
    type: 'home'
  }
});

// TIP: You can set up associations manually ( and not necessarily in a factory )
// To set up an employee ( hasMany ) phone numbers manually, try this:
let phoneNumbers = buildList('phone-numbers', 2).get();
let employee = make('employee', { phoneNumbers });

```

For a more detailed example of setting up fragments have a look at:
  - model test [employee test](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/unit/models/employee-test.js).
  - acceptance test [employee-view-test](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/acceptance/employee-view-test.js).

### Creating Factories in Addons
If you are making an addon with factories and you want the factories available to Ember apps using your addon, place the factories in `test-support/factories` instead of `tests/factories`. They should be available both within your addon and in Ember apps that use your addon.

### Ember Django Adapter
  - available since 2.6.1
  - everything is setup automatically
  - sideloading is not supported in `DRFSerializer` so all relationships should either
    - be set as embedded with `DS.EmbeddedRecordsMixin` if you want to use `build`/`buildList`
    - or use `make`/`makeList` and in your mocks, and return models instead of json:
```javascript
  let projects = makeList('projects', 2); // put projects in the store
  let user = make('user', { projects });  // attach them to user
  mockFindRecord('user').returns({model: user}); // now the mock will return a user that has projects
```
  - using `fails()` with errors hash is not working reliably
    - so you can always just `mockWhatever(args).fails()`

### Custom API formats

FactoryGuy handles JSON-API / RESTSerializer / JSONSerializer out of the box.

In case your API doesn't follow any of these conventions, you can still make a custom fixture builder
 or modify the `FixtureConverters` and `JSONPayload` classes that exist.
 - before I launch into the details, let me know if you need this hookup and I
   can guide you to a solution, since the use cases will be rare and varied.


#### `FactoryGuy.cacheOnlyMode`
  - Allows you to setup the adapters to prevent them from fetching data with ajax calls
    - for single models ( `find` ) you have to put something in the store
    - for collections ( `findAll` ) you don't have to put anything in the store
  - Takes `except` parameter as a list of models you don't want to cache
    - These model requests will go to the server with ajax calls and will need to be mocked

This is helpful, when:
  - you want to set up the test data with `make`/`makeList`, and then prevent
    calls like `store.find` or `store.findAll` from fetching more data, since you have
    already setup the store with `make`/`makeList` data.
  - you have an application that starts up and loads data that is not relevant
    to the test page you are working on.

Usage:

```javascript
import FactoryGuy, { makeList } from 'ember-data-factory-guy';
import moduleForAcceptance from '../helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | Profiles View');

test("Using FactoryGuy.cacheOnlyMode", function() {
  FactoryGuy.cacheOnlyMode();
  // the store.find call for the user will go out unless there is a user
  // in the store
  make('user', {name: 'current'});
  // the application starts up and makes calls to findAll a few things, but
  // those can be ignored because of the cacheOnlyMode

  // for this test I care about just testing profiles
  makeList("profile", 2);

  visit('/profiles');

  andThen(()=> {
    // test stuff
  });
});

test("Using FactoryGuy.cacheOnlyMode with except", function() {
  FactoryGuy.cacheOnlyMode({except: ['profile']});

  make('user', {name: 'current'});

  // this time I want to allow the ajax call so I can return built json payload
  mockFindAll("profile", 2);

  visit('/profiles');

  andThen(()=> {
    // test stuff
  });
});
```

### Testing models, controllers, components

- FactoryGuy needs to setup the factories before the test run.
  - By default, you only need to call `manualSetup(this.container)` in unit/component tests
  - If you are using mock methods, such as `mockQuery`, use `mockSetup()` and `mockTeardown()`

- Sample model test: [profile-test.js](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/unit/models/profile-test.js)
  - Use `moduleForModel` ( ember-qunit ), or `describeModel` ( ember-mocha ) test helper
  - manually set up FactoryGuy

- Sample component test #1: [single-user-manual-setup-test.js](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/components/single-user-manual-setup-test.js)
  - Using `moduleForComponent` ( ember-qunit ), or `describeComponent` ( ember-mocha ) helper
  - manually sets up FactoryGuy ( so it's faster )

  ```javascript
  import { make, manualSetup }  from 'ember-data-factory-guy';
  import hbs from 'htmlbars-inline-precompile';
  import { test, moduleForComponent } from 'ember-qunit';

  moduleForComponent('single-user', 'Integration | Component | single-user (manual setup)', {
    integration: true,

    beforeEach: function () {
      manualSetup(this.container);
    }
  });

  test("shows user information", function () {
    let user = make('user', {name: 'Rob'});

    this.render(hbs`{{single-user user=user}}`);
    this.set('user', user);

    ok(this.$('.name').text().match(user.get('name')));
    ok(this.$('.funny-name').text().match(user.get('funnyName')));
  });
  ```

- Sample component test #2: [single-user-test.js](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/components/single-user-test.js)
  - Using `moduleForComponent` ( ember-qunit ), or `describeComponent` ( ember-mocha ) helper
  - Starts a new application with `startApp()` before each test  ( slower )


### Acceptance Tests

##### Using mock methods

- Uses mockjax
  - for mocking the ajax calls made by ember-data
  - this library is installed with FactoryGuy
- http GET mocks
  - [FactoryGuy.mockFindRecord](#factoryguymockfindrecord)
  - [FactoryGuy.mockFindAll](#factoryguymockfindall)
  - [FactoryGuy.mockReload](#factoryguymockreload)
  - [FactoryGuy.mockQuery](#factoryguymockquery)
  - [FactoryGuy.mockQueryRecord](#factoryguymockqueryrecord)
  - takes modifier method `returns()` for setting the payload response
    - `returns()` accepts parameters like: json, model, models, id, ids, headers
      - headers are cumulative so you can add as many as you like
      - Example:
      ```javascript
        let mock = mockFindAll('user').returns({headers: {'X-Man': "Wolverine"});
        mock.returns({headers: {'X-Weapon': "Claws"});
      ```
  - these mocks are are reusable
    - so you can simulate making the same ajax call ( url ) and return a different payload
- http POST/PUT/DELETE
  - [FactoryGuy.mockCreate](#factoryguymockcreate)
  - [FactoryGuy.mockUpdate](#factoryguymockupdate)
  - [FactoryGuy.mockDelete](#factoryguymockdelete)

- Use method `fails()` to simulate failure
- Use method `succeeds()` to simulate success
 - Only used if the mock was set to fail with ```fails()```  and you want to set the
   mock to succeed to simulate a successful retry

- Use property ```timesCalled``` to verify how many times the ajax call was mocked
  - works when you are using `mockQuery`, `mockQueryRecord`, `mockFindAll`, `mockReload`, or `mockUpdate`
  - `mockFindRecord` will always be at most 1 since it will only make ajax call
    the first time, and then the store will use cache the second time
  - Example:
  ```javascript
    const mock = mockQueryRecord('company', {}).returns({ json: build('company') });

    FactoryGuy.store.queryRecord('company', {}).then(()=> {
      FactoryGuy.store.queryRecord('company', {}).then(()=> {
        mock.timesCalled //=> 2
      });
    });
  ```

- Use method `disable()` to temporarily disable the mock. You can re-enable
the disabled mock using `enable()`.

- Use method `destroy()` to completely remove the mockjax handler for the mock.
The `isDestroyed` property is set to `true` when the mock is destroyed.


##### setup and teardown
  - Use ```mockSetup()``` in test setup/beforeEach
   - set logging options here:
      - logLevel ( 0 - off , 1 - on ) for seeing the FactoryGuy responses
      - responseTime ( in millis )  for simulating slower responses
      - mockjaxLogLevel ( 1 - 4 max ) for seeing mockjax logging
    - Example:
    ```javascript
      mockSetup({logLevel: 1, responseTime: 1000, mockjaxLogLevel: 4});
    ```
  - Use ```mockTeardown()``` in test teardown/afterEach
  - Easiest is to set them up in [module-for-acceptance.js:](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/helpers/module-for-acceptance.js)

##### Using fails method
  - Usable on all mocks
  - Use optional object arguments status and response and convertErrors to customize
    - status : must be number in the range of 3XX, 4XX, or 5XX ( default is 500 )
    - response : must be object with errors key ( default is null )
    - convertErrors : set to false and object will be left untouched ( default is true )
      - errors must be in particular format for ember-data to accept them
        - FactoryGuy allows you to use a simple style: ```{errors: {name: "Name too short"}}```
        - Behind the scenes converts to another format for ember-data to consume

  - Examples:
  ```javascript
    let errors401 = {errors: {description: "Unauthorized"}};
    let mock = mockFindAll('user').fails({status: 401, response: errors401});

    let errors422 = {errors: {name: "Name too short"}};
    let mock = mockFindRecord('profile').fails({status: 422, response: errors422});

    let errorsMine = {errors: [{detail: "Name too short", title: "I am short"}]};
    let mock = mockFindRecord('profile').fails({status: 422, response: errorsMine, convertErrors: false});
  ```


##### `FactoryGuy.mockFindRecord`
  - For dealing with finding one record of a model type => `store.find('modelType')`
  - Can pass in arguments just like you would for [`make`](#factoryguymake) or [`build`](#factoryguybuild)
    - `mockFindRecord`( fixture or model name, optional traits, optional attributes object)
  - Takes modifier method `returns()` for controlling the response payload
    - returns( model / json / id )
  - Sample acceptance tests using `mockFindRecord`: [user-view-test.js:](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/acceptance/user-view-test.js)

Usage:
```javascript
   import { build, make, mockFindRecord } from 'ember-data-factory-guy';
```
- To return default factory model type ( 'user' in this case )
```javascript
   // mockFindRecord automatically returns json for the modelType ( in this case 'user' )
   let mock = mockFindRecord('user');
   let userId = mock.get('id');
```
- Using `returns({json})` to return json object
```javascript
   let user = build('user', 'whacky', {isDude: true});
   let mock = mockFindRecord('user').returns({ json: user });
   // user.get('id') => 1
   // user.get('style') => 'whacky'

   // or to acccomplish the same thing with less code
   let mock = mockFindRecord('user', 'whacky', {isDude: true});
   // mock.get('id') => 1
   // mock.get('style') => 'whacky'
   let user = mock.get();
   // user.id => 1
   // user.style => 'whacky'
```
- Using `returns({model})` to return model instance
```javascript
   let user = make('user', 'whacky', {isDude: false});
   let mock = mockFindRecord('user').returns({ model: user });
   // user.get('id') => 1
   // you can now also user.get('any-computed-property')
   // since you have a real model instance
```
- Simper way to return a model instance
```javascript
   let user = make('user', 'whacky', {isDude: false});
   let mock = mockFindRecord(user);
   // user.get('id') === mock.get('id')
   // basically a shortcut to the above .returns({ model: user })
   // as this sets up the returns for you
```

- To reuse the mock
```javascript
   let user2 = build('user', {style: "boring"});
   mock.returns({ json: user2 });
   // mock.get('id') => 2
```
- To mock failure case use `fails` method
```javascript
   mockFindRecord('user').fails();
```
- To mock failure when you have a model already
```javascript
  let profile = make('profile');
  mockFindRecord(profile).fails();
  // mock.get('id') === profile.id
```

##### `FactoryGuy.mockFindAll`
  - For dealing with finding all records for a model type => `store.findAll(modelType)`
  - Takes same parameters as [makeList](#factoryguymakelist)
    - `mockFindAll`( fixture or model name, optional number, optional traits, optional attributes object)
  - Takes modifier method `returns()` for controlling the response payload
    - returns( models / json / ids )
  - Sample acceptance tests using `mockFindAll`: [users-view-test.js](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/acceptance/users-view-test.js)

Usage:

```javascript
   import { buildList, makeList, mockFindAll } from 'ember-data-factory-guy';
```
- To mock and return no results
```javascript
   let mock = mockFindAll('user');
```
- Using `returns({json})` to return json object
```javascript
   // that has 2 different users:
   let users = buildList('user', 'whacky', 'silly');
   let mock = mockFindAll('user').returns({ json: users });
   let user1 = users.get(0);
   let user2 = users.get(1);
   // user1.style => 'whacky'
   // user2.style => 'silly'

   // or to acccomplish the same thing with less code
   let mock = mockFindAll('user', 'whacky', 'silly');
   let user1 = mock.get(0);
   let user2 = mock.get(1);
   // user1.style => 'whacky'
   // user2.style => 'silly'
```
 - Using `returns({models})` to return model instances
```javascript
    let users = makeList('user', 'whacky', 'silly');
    let mock = mockFindAll('user').returns({ models: users });
    let user1 = users[0];
    // you can now also user1.get('any-computed-property')
    // since you have a real model instance
```
- To reuse the mock and return different payload
```javascript
   let users2 = buildList('user', 3);
   mock.returns({ json: user2 });
```
- To mock failure case use `fails()` method
```javascript
   mockFindAll('user').fails();
```

##### `FactoryGuy.mockReload`
  - To handle reloading a model
    - Pass in a record ( or a typeName and id )

Usage:

- Passing in a record / model instance
```javascript
  let profile = make('profile');
  mockReload(profile);

  // will stub a call to reload that profile
  profile.reload()
```
- Using `returns({attrs})` to return new attributes
```javascript
  let profile = make('profile', { description: "whatever" });
  mockReload(profile).returns({ attrs: { description: "moo" } });
  profile.reload(); // description is now "moo"
```
- Using `returns({json})` to return all new attributes
```javascript
  let profile = make('profile', { description: "tomatoes" });
  // all new values EXCEPT the profile id ( you should keep that id the same )
  let profileAllNew = build('profile', { id: profile.get('id'), description: "potatoes" }
  mockReload(profile).returns({ json: profileAllNew });
  profile.reload(); // description = "potatoes"
```
- Mocking a failed reload
```javascript
  mockReload('profile', 1).fails();
```

##### `FactoryGuy.mockQuery`
  - For dealing with querying for all records for a model type => `store.query(modelType, params)`
    - Takes modifier method `returns()` for controlling the response payload
      - returns( models / json / ids )
   - Takes modifier methods for matching the query params
    - `withParams( object )`
    - `withSomeParams( object )`
  - Sample acceptance tests using `mockQuery`: [user-search-test.js](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/acceptance/user-search-test.js)

Usage:

```javascript
  import FactoryGuy, { make, build, buildList, mockQuery } from 'ember-data-factory-guy';
  let store = FactoryGuy.store;

  // This simulates a query that returns no results
  mockQuery('user', {age: 10});

  store.query('user', {age: 10}}).then((userInstances) => {
    /// userInstances will be empty
  })
```

  - with returns( models )
```javascript
  // Create model instances
  let users = makeList('user', 2, 'with_hats');

  mockQuery('user', {name:'Bob', age: 10}).returns({models: users});

  store.query('user', {name:'Bob', age: 10}}).then((models)=> {
    // models are the same as the users array
  });
```

  - with returns ( json )
``` js
  // Create json with buildList
  let users = buildList('user', 2, 'with_hats');

  mockQuery('user', {name:'Bob', age: 10}).returns({json: users});

  store.query('user', {name:'Bob', age: 10}}).then((models)=> {
    // these models were created from the users json
  });
```

  - with returns( ids )
```javascript
  // Create list of models
  let users = buildList('user', 2, 'with_hats');
  let user1 = users.get(0);

  mockQuery('user', {name:'Bob', age: 10}).returns({ids: [user1.id]});

  store.query('user', {name:'Bob', age: 10}}).then(function(models) {
    // models will be one model and it will be user1
  });

```

  - withParams() / withSomeParams()
```javascript
  // Create list of models
  let users = buildList('user', 2, 'with_hats');
  let user1 = users.get(0);

  mock = mockQuery('user').returns({ids: [user1.id]});

  mock.withParams({name:'Bob', age: 10})

  // When using 'withParams' modifier, params hash must match exactly
  store.query('user', {name:'Bob', age: 10}}).then(function(models) {
    // models will be one model and it will be user1
  });

  // The following call will not be caught by the mock
  store.query('user', {name:'Bob', age: 10, hair: 'brown'}})

  // 'withSomeParams' is designed to catch requests by partial match
  // It has precedence over strict params matching once applied
  mock.withSomeParams({name:'Bob'})

  // Now both requests will be intercepted
  store.query('user', {name:'Bob', age: 10}})
  store.query('user', {name:'Bob', age: 10, hair: 'brown'}})
```

##### `FactoryGuy.mockQueryRecord`
  - For dealing with querying for one record for a model type => `store.queryRecord(modelType, params)`
    - takes modifier method `returns()` for controlling the response payload
      - returns( model / json / id )
   - takes modifier methods for matching the query params
    - withParams( object )

Usage:

```javascript
  import FactoryGuy, { make, build, mockQueryRecord } from 'ember-data-factory-guy';
  let store = FactoryGuy.store;

  // This simulates a query that returns no results
  mockQueryRecord('user', {age: 10});

  store.queryRecord('user', {age: 10}}).then((userInstance) => {
    /// userInstance will be empty
  })
```

  - with returns( models )
```javascript
  // Create model instances
  let user = make('user');

  mockQueryRecord('user', {name:'Bob', age: 10}).returns({model: user});

  store.queryRecord('user', {name:'Bob', age: 10}}).then((model)=> {
    // model is the same as the user you made
  });
```

  - with returns( json )
``` js
  // Create json with buildList
  let user = build('user');

  mockQueryRecord('user', {name:'Bob', age: 10}).returns({json: user});

  store.queryRecord('user', {name:'Bob', age: 10}}).then((model)=> {
    // user model created from the user json
  });
```

  - with returns( ids )

```javascript
  // Create list of models
  let user = build('user', 'with_hats');

  mockQueryRecord('user', {name:'Bob', age: 10}).returns({id: user.get('id')});

  store.queryRecord('user', {name:'Bob', age: 10}}).then(function(model) {
    // model will be one model and it will be user1
  });

```

##### `FactoryGuy.mockCreate`

  - Use chainable methods to build the response
    - match: takes a hash with attributes or a matching function
      1. attributes that must be in request json
        - These will be added to the response json automatically, so
          you don't need to include them in the returns hash.
        - If you match on a `belongsTo` association, you don't have to include that in
          the returns hash either ( same idea )
      1. a function that can be used to perform an arbitrary match against the request
          json, returning `true` if there is a match, `false` otherwise.
    - returns
      - attributes ( including relationships ) to include in response json
  - Need to wrap tests using `mockCreate` with: `Ember.run(function() { 'your test' })`

Realistically, you will have code in a view action or controller action that will
 create the record, and setup any associations.

```javascript

  // most actions that create a record look something like this:
  action: {
    addProject: function (user) {
      let name = this.$('button.project-name').val();
      this.store.createRecord('project', {name: name, user: user}).save();
    }
  }

```

In this case, you are are creating a 'project' record with a specific name, and belonging
to a particular user. To mock this `createRecord` call here are a few ways to do this using
chainable methods.

Usage:

```javascript
  import { mockCreate } from 'ember-data-factory-guy';

  // Simplest case
  // Don't care about a match just handle createRecord for any project
  mockCreate('project');

  // Matching some attributes
  mockCreate('project').match({name: "Moo"});

  // Match all attributes
  mockCreate('project').match({name: "Moo", user: user});

  // Match using a function that checks that the request's top level attribute "name" equals 'Moo'
  mockCreate('project').match(requestData => requestData.name === 'Moo');

  // Exactly matching attributes, and returning extra attributes
  mockCreate('project')
    .match({name: "Moo", user: user})
    .returns({created_at: new Date()});

  // Returning belongsTo relationship. Assume outfit belongsTo 'person'
  let person = build('super-hero'); // it's polymorphic
  mockCreate('outfit').returns({attrs: { person }});

  // Returning hasMany relationship. Assume super-hero hasMany 'outfits'
  let outfits = buildList('outfit', 2);
  mockCreate('super-hero').returns({attrs: { outfits }});

```

  - mocking a failed create

```javascript

  // Mocking failure case is easy with chainable methods, just use #fails
  mockCreate('project').match({name: "Moo"}).fails();

  // Can optionally add a status code and/or errors to the response
  mockCreate('project').fails({status: 422, response: {errors: {name: ['Moo bad, Bahh better']}}});

  store.createRecord('project', {name: "Moo"}).save(); //=> fails
```


##### `FactoryGuy.mockUpdate`

  - `mockUpdate(model)`
    - Single argument ( the model instance that will be updated )
  - `mockUpdate(modelType, id)`
    - Two arguments: modelType ( like 'profile' ) , and the profile id that will updated
  - Use chainable methods to help build response:
    - `match`: takes a hash with attributes or a matching function
      1. attributes with values that must be present on the model you are updating
      1. a function that can be used to perform an arbitrary match against the request
        json, returning `true` if there is a match, `false` otherwise.
    - returns
      - attributes ( including relationships ) to include in response json
  - Need to wrap tests using `mockUpdate` with: `Ember.run(function() { 'your test' })`

Usage:

```javascript
  import { make, mockUpdate } from 'ember-data-factory-guy';

  let profile = make('profile');

  // Pass in the model that will be updated ( if you have it available )
  mockUpdate(profile);

  // If the model is not available, pass in the modelType and the id of
  // the model that will be updated
  mockUpdate('profile', 1);

  profile.set('description', 'good value');
  profile.save() //=> will succeed

  // Returning belongsTo relationship. Assume outfit belongsTo 'person'
  let outfit = make('outfit');
  let person = build('super-hero'); // it's polymorphic
  outfit.set('name','outrageous');
  mockUpdate(outfit).returns({attrs: { person }});
  outfit.save(); //=> saves and returns superhero

  // Returning hasMany relationship. Assume super-hero hasMany 'outfits'
  let superHero = make('super-hero');
  let outfits = buildList('outfit', 2, {name:'bell bottoms'});
  superHero.set('style','laid back');
  mockUpdate(superHero).returns({attrs: { outfits }});
  superHero.save(); // => saves and returns outfits

  // using match() method to specify attribute values
  let profile = make('profile');
  profile.set('name', "woo");
  let mock = mockUpdate(profile).match({name: "moo"});
  profile.save();  // will not be mocked since the mock you set says the name must be "woo"

  // using match() method to specify a matching function
  let profile = make('profile');
  profile.set('name', "woo");
  let mock = mockUpdate(profile).match(requestData => requestData.name === "moo");
  profile.save();  // will not be mocked since the mock you set requires the request's top level attribute "name" to equal "moo"

  // either set the name to "moo" which will now be mocked correctly
  profile.set('name', "moo");
  profile.save(); // succeeds

  // or

  // keep the profile name as "woo"
  // but change the mock to match the name "woo"
  mock.match({name: "woo"});
  profile.save();  // succeeds
````

 - mocking a failed update

```javascript
  let profile = make('profile');

  // set the succeed flag to 'false'
  mockUpdate('profile', profile.id).fails({status: 422, response: 'Invalid data'});
  // or
  mockUpdate(profile).fails({status: 422, response: 'Invalid data'});

  profile.set('description', 'bad value');
  profile.save() //=> will fail
````

*mocking a failed update and retry with success*

```javascript
  let profile = make('profile');

  let mockUpdate = mockUpdate(profile);

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


##### `FactoryGuy.mockDelete`
  - Need to wrap tests using `mockDelete` with: `Ember.run(function() { 'your test' })`
  - To handle deleting a model
    - Pass in a record ( or a typeName and id )

Usage:

- Passing in a record / model instance

```javascript
  import { make, mockDelete } from 'ember-data-factory-guy';

  let profile = make('profile');
  mockDelete(profile);

  profile.destroyRecord() // => will succeed
```

- Passing in a model typeName and id

```javascript
  import { make, mockDelete } from 'ember-data-factory-guy';

  let profile = make('profile');
  mockDelete('profile', profile.id);

  profile.destroyRecord() // => will succeed
```

- Passing in a model typeName

```javascript
  import { make, mockDelete } from 'ember-data-factory-guy';

  let profile1 = make('profile');
  let profile2 = make('profile');
  mockDelete('profile');

  profile1.destroyRecord() // => will succeed
  profile2.destroyRecord() // => will succeed
```

- Mocking a failed delete

```javascript
    mockDelete(profile).fails();
```


### Tips and Tricks

#### Tip 1: Fun with `makeList`/`buildList` and traits
  - This is probably the funnest thing in FactoryGuy, if you're not using this
  syntax yet, you're missing out.
  
  ```javascript
   let json    = buildList('widget', 'square', 'round', ['round','broken']);
   let widgets = makeList('widget', 'square', 'round', ['round','broken']);
   let [roundWidget, squareWidget, roundBrokenWidget] = widgets;
  ```
    - you just built/made 3 different widgets from traits ('square', 'round', 'broken')
    - the first will have the square trait
    - the second will have the round trait
    - the third will have both round and broken trait

  - Check out [makeList](#factoryguymakelist) and [buildList](#factoryguybuildlist) for more ideas

#### Tip 2: Testing model's custom `serialize()` method
  - The fact that you can match on attributes in `mockUpdate` and `mockCreate` means
   that you can test a custom `serialize()` method in a model serializer

```javascript

  // app/serializers/person.js
  export default DS.RESTSerializer.extend({

    // let's say you're modifying all names to be Japanese honorific style
    serialize: function(snapshot, options) {
      var json = this._super(snapshot, options);
  
      let honorificName = [snapshot.record.get('name'), 'san'].join('-');
      json.name = honorificName;
  
      return json;
    }
  });

  // somewhere in your tests
  let person = make('person', {name: "Daniel"});
  mockUpdate(person).match({name: "Daniel-san"});
  person.save(); // will succeed
  // and voila, you have just tested the serializer is converting the name properly
```

- You could also test ```serialize()``` method in a simpler way by doing this:

```javascript  
  let person = make('person', {name: "Daniel"});
  let json = person.serialize();
  assert.equal(json.name, 'Daniel-san');
```

#### Tip 3: Building static / fixture like data into the factories.

 - States are the classic case. There is a state model, and there are 50 US states. 
 - You could use a strategy to get them with traits like this:
 
```javascript
  import FactoryGuy from 'ember-data-factory-guy';
  
  FactoryGuy.define('state', {
  
    traits: {
      NY: { name: "New York", id: "NY" },
      NJ: { name: "New Jersey", id: "NJ" },
      CT: { name: "Connecticut", id: "CT" }
    }
  });
  
  // then in your tests you would do 
  let [ny, nj, ct] = makeList('state', 'ny', 'nj', 'ct'); 
```
- Or you could use a strategy to get them like this:

```javascript
  import FactoryGuy from 'ember-data-factory-guy';
  
  const states = [
    { name: "New York", id: "NY" },
    { name: "New Jersey", id: "NJ" },
    { name: "Connecticut", id: "CT" }
    ... blah .. blah .. blah
  ];

  FactoryGuy.define('state', {
  
    default: {
      id: FactoryGuy.generate((i)=> states[i-1].id),
      name: FactoryGuy.generate((i)=> states[i-1].name)
    }
  });
  
  // then in your tests you would do 
  let states = makeList('state', 3); // or however many states you have 
```

#### Tip 4: Using Scenario class in tests
  - encapsulate data interaction in a scenario class
    - sets up data 
    - has helper methods to retrieve data 
  - similar to how page objects abstract away the interaction with a page/component

Example:

```javascript
// file: tests/scenarios/admin.js
import Ember from 'ember';
import {Scenario}  from 'ember-data-factory-guy';

export default class extends Scenario {

  run() {
    this.createGroups();
  }
  
  createGroups() {
    this.permissionGroups = this.makeList('permission-group', 3);
  }
  
  groupNames() {
    return this.permissionGroups.mapBy('name').sort();
  }
}

// file: tests/acceptance/admin-view-test.js
import page from '../pages/admin';
import Scenario from '../scenarios/admin';

describe('Admin View', function() {
  let scenario;

  beforeEach(function() {
    scenario = new Scenario();
    scenario.run();
  });

  describe('group', function() {
    beforeEach(function() {
      page.visitGroups();
    });

    it('shows all groups', function() {
      expect(page.groups.names).to.arrayEqual(scenario.groupNames());
    });
  });
});
```

### ChangeLog
  - [Release Notes](/releases)
