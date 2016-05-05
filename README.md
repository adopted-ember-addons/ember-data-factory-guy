# Ember Data Factory Guy

[![Build Status](https://secure.travis-ci.org/danielspaniel/ember-data-factory-guy.png?branch=master)](http://travis-ci.org/danielspaniel/ember-data-factory-guy) [![Ember Observer Score](http://emberobserver.com/badges/ember-data-factory-guy.svg)](http://emberobserver.com/addons/ember-data-factory-guy) [![npm version](https://badge.fury.io/js/ember-data-factory-guy.svg)](http://badge.fury.io/js/ember-data-factory-guy)

Feel the thrill and enjoyment of testing when using Factories instead of Fixtures.  
Factories simplify the process of testing, making you more efficient and your tests more readable.  

**Support for [ember-data-model-fragment](https://github.com/lytics/ember-data-model-fragments) usage is baked in since v2.5.0** 
                                  
Questions: Slack => [factory-guy](https://embercommunity.slack.com/messages/e-factory-guy/)

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
  - [Ember Data Model Fragments](https://github.com/danielspaniel/ember-data-factory-guy#ember-data-model-fragments)
  - [Callbacks](https://github.com/danielspaniel/ember-data-factory-guy#callbacks)
  - [Testing - creating scenarios](https://github.com/danielspaniel/ember-data-factory-guy#testing---creating-scenarios)
  - [Testing models, controllers, components](https://github.com/danielspaniel/ember-data-factory-guy#testing-models-controllers-components)
  - [Acceptance Tests](https://github.com/danielspaniel/ember-data-factory-guy#acceptance-tests)

ChangeLog: ( Notes about what has changed in each version )
  - [Release Notes](https://github.com/danielspaniel/ember-data-factory-guy/releases)

### Installation

 - ```ember install ember-data-factory-guy@2.5.3``` ( ember-data-1.13.5+ )
 - ```ember install ember-data-factory-guy@1.13.2``` ( ember-data-1.13.0 + )
 - ```ember install ember-data-factory-guy@1.1.2``` ( ember-data-1.0.0-beta.19.1 )
 - ```ember install ember-data-factory-guy@1.0.10``` ( ember-data-1.0.0-beta.16.1 )

### Upgrade
 -  remove ember-data-factory-guy from package.json
 - ```npm prune```
 - ```ember install ember-data-factory-guy  ( for latest release )``` 
 
### How this works

  - You create factories for you models.
    - put them in tests/factories directory
  - Then you use them to create models in your tests.
    - You can make records that persist in the store
    - Or you can build a json payload used for mocking an ajax call's payload

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

Usage:

##### make  
```javascript

  import { make } from 'ember-data-factory-guy';
  
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

##### makeList
  - check out [(user factory):](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/dummy/app/tests/factories/user.js) to see 'bob' user and 'with_car' trait  

Usage:

```javascript

  import { make, makeList } from 'ember-data-factory-guy';
  
  // Let's say bob is a named type in the 
  makeList('bob') // makes 0 bob's

  makeList('bob', 2) // makes 2 bob's

  makeList('bob', 2, 'with_car' , {name: "Dude"})
  // makes 2 bob's that have 'with_car' trait and name of "Dude"
  // In other words, applies the traits and options to every bob made  

  makeList('bob', 'with_car', ['with_car',{name: "Dude"}])
  // 2 User models with bob attributes, where the first also has 'with_car' trait
  // the last has 'with_car' trait and name of "Dude", so you get 2 different bob's
  

```
##### build
  - for building json that you can pass json payload in [acceptance tests](https://github.com/danielspaniel/ember-data-factory-guy#acceptance-tests)
  - build takes same arguments as make 
  - can compose relationships with other build/buildList payloads
  - to inspect the json use the get() method
  
Usage: 

```javascript
  
  import { build, buildList } from 'ember-data-factory-guy';  
  
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

  // build and compose relationships to unlimited degree
  let company1 = build('company', {name: 'A Corp'});
  let company2 = build('company', {name: 'B Corp'});
  let owners = buildList('user', { company:company1 }, { company:company2 });
  let buildJson = build('property', { owners });

```
- Example: what json payload from build looks like
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

##### buildList
  - for building json that you can pass json payload in [acceptance tests](https://github.com/danielspaniel/ember-data-factory-guy#acceptance-tests)
  - buildList takes the same arguments as makeList
  - can compose relationships with other build/buildList payloads
  - to inspect the json use the get() method
    - can use get(index) to get to items in the list

Usage: 

```js
  import { build, buildList } from 'ember-data-factory-guy';
  
  let owners = buildList('bob', 2);  // builds 2 Bob's
  
  let owners = buildList('bob', 2, {name: 'Rob'); // builds 2 Bob's with name of 'Rob'
  
  // builds 2 users, one with name 'Bob' , the next with name 'Rob'  
  let owners = buildList('user', { name:'Bob' }, { name:'Rob' });
```

##### Using get() method 
  - for inspecting contents of json payload
    - get() returns all attributes of top level model 
    - get(attribute) gives you attribute in top level model
    - get(index) gives you the info for hasMany relationship at that index
    - get(relationships) gives you just id or type ( if polymorphic )
      - better to compose the build relationships by hand if you need more info
  - check out [user factory:](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/dummy/app/tests/factories/user.js) to see 'boblike' and 'adminlike' user traits

```js 
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
  - Can reference all other attributes, even id

```javascript

  FactoryGuy.define('user', {
    sequences: {
      userName: (num)=> `User${num}`
    },
    default: { 
      name: FactoryGuy.generate('userName') 
    },
    traits: {
      boringStyle: {
        style: (f)=> `${f.id} boring `
      }
      funnyUser: {
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
  - With [build](https://github.com/danielspaniel/ember-data-factory-guy#build) / [buildList](https://github.com/danielspaniel/ember-data-factory-guy#buildlist) and [make](https://github.com/danielspaniel/ember-data-factory-guy#make) / [makeList](https://github.com/danielspaniel/ember-data-factory-guy#makelist) 
    - Can compose relationships to any level 

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
  - See [build](https://github.com/danielspaniel/ember-data-factory-guy#build) / [buildList](https://github.com/danielspaniel/ember-data-factory-guy#buildlist) and [make](https://github.com/danielspaniel/ember-data-factory-guy#make) / [makeList](https://github.com/danielspaniel/ember-data-factory-guy#makelist) for more ideas 

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
  - See [build](https://github.com/danielspaniel/ember-data-factory-guy#build) / [buildList](https://github.com/danielspaniel/ember-data-factory-guy#buildlist) and [make](https://github.com/danielspaniel/ember-data-factory-guy#make) / [makeList](https://github.com/danielspaniel/ember-data-factory-guy#makelist) for more ideas
  
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

### Ember Data Model Fragments
As of 2.5.2 you can create factories which contain [ember-data-model-fragments](https://github.com/lytics/ember-data-model-fragments). Setting up your fragments is easy and follows the same process as setting up regular factories. The mapping between fragment types and their associations are like so:

Fragment Type | Association
--- | ---
`fragment` | `FactoryGuy.belongsTo`
`fragmentArray` | `FactoryGuy.hasMany`
`array` | `[]`

For example, say we have the following `Employee` model which makes use of the `fragment`, `fragmentArray` and `array` fragment types.

```javascript
//Employee model
export default Model.extend({
  name      : fragment('name'),
  phoneNumbers: fragmentArray('phone-number')
})

//Name fragment
export default Fragment.extend({
  titles: array('string'),
  firstName : attr('string'),
  lastName  : attr('string')
});

//Phone Number fragment
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
FactoryGuy.define('employee', {
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
```

For a more detailed example of setting up fragments have a look at the [employee test](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/unit/models/employee-test.js).

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
  - Allows you to setup the adapters to prevent them from fetching data with ajax call 
    - for single models ( find ) you have to put something in the store
    - for collections ( findAll ) you don't have to put anything in the store.
  - Takes `except` parameter as a list of models you don't want to cache. 
    - These model requests will go to server with ajax call and need to be mocked.
   
This is helpful, when: 
  - you want to set up the test data with make/makeList, and then prevent
    calls like store.find or findAll from fetching more data, since you have 
    already setup the store with make/makeList data. 
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
  - use manualSetup function to set up FactoryGuy in unit/component tests

- [Sample model test (profile-test.js):](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/unit/models/profile-test.js)
  - Use 'moduleForModel' ( ember-qunit ), or describeModel ( ember-mocha ) test helper
  - manually set up Factory guy 
  
- [Sample component test #1 (single-user-manual-setup-test.js):](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/components/single-user-manual-setup-test.js)
  - Using 'moduleForComponent' ( ember-qunit ), or describeComponent ( ember-mocha ) helper
  - Manually sets up Factory guy ( so it's faster )

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

- [Sample component test #2 (single-user-test.js):](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/components/single-user-test.js)
  - Using 'moduleForComponent' ( ember-qunit ), or describeComponent ( ember-mocha ) helper
  - Starts a new application with startApp() before each test  ( slower )


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
  - [mockCreate](https://github.com/danielspaniel/ember-data-factory-guy#mockcreate)
  - [mockUpdate](https://github.com/danielspaniel/ember-data-factory-guy#mockupdate)
  - [mockDelete](https://github.com/danielspaniel/ember-data-factory-guy#mockdelete)
- can use method `fails()` to simulate failure, and then `succeeds()` to simulate success
  - to customize failure, fails method takes optional object with status and errors.
  - Example: 
  ```javascript
    let mock = mockFindAll('user').fails({status: 401, errors: {description: "Unauthorized"}}); 
  ```
- mock#timesCalled 
  - verify how many times the ajax call was mocked
  - use `timesCalled` property on the mock
  - works when you are using mockQuery, mockQueryRecord, mockFindAll, or mockUpdate
  - mockFind will always be at most 1 since it will only make ajax call
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

##### setup and teardown
  - Use ```mockSetup()``` in test setup/beforeEach 
  - Use ```mockTeardown()``` in test teardown/afterEach
  - Easiest is to set them up in [module-for-acceptance.js:](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/helpers/module-for-acceptance.js)

##### mockFind
  - For dealing with finding one record of a model type => `store.find('modelType')`
  - Can pass in arguments just like you would for [make](https://github.com/danielspaniel/ember-data-factory-guy#make) or [build](https://github.com/danielspaniel/ember-data-factory-guy#build)
    - mockFind( fixture or model name, optional traits, optional attributes object)
  - Takes modifier method `returns()` for controlling the response payload
    - returns( model / json / id )
  - Sample acceptance tests using mockFind: [user-view-test.js:](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/acceptance/user-view-test.js)

Usage:
```javascript
   import { build, make, mockFind } from 'ember-data-factory-guy';
```
- To return default factory model type ( 'user' in this case )
```javascript
   // mockFind automatically returns json for the modelType ( in this case 'user' )  
   let mock = mockFind('user');
   let userId = mock.get('id');
```
- Using `returns({json})` to return json object  
```javascript
   let user = build('user', 'whacky', {isDude: true});
   let mock = mockFind('user').returns({ json: user });
   // user.get('id') => 1
   // user.get('style') => 'whacky'
   
   // or to acccomplish the same thing with less code 
   let mock = mockFind('user', 'whacky', {isDude: true});
   // mock.get('id') => 1
   // mock.get('style') => 'whacky'
   let user = mock.get();
   // user.id => 1
   // user.style => 'whacky'
```
- Using `returns({model})` to return model instance
```javascript
   let user = make('user', 'whacky', {isDude: false});
   let mock = mockFind('user').returns({ model: user });
   // user.get('id') => 1
   // you can now also user.get('any-computed-property') 
   // since you have a real model instance
```
- To reuse the mock
```javascript
   let user2 = build('user', {style: "boring"});
   mock.returns({ json: user2 });
   // mock.get('id') => 2
```
- To mock failure case use `fails` method
```javascript  
   mockFind('user').fails();
```

##### mockFindAll
  - For dealing with finding all records for a model type => `store.findAll(modelType)`
  - Takes same parameters as [makeList](https://github.com/danielspaniel/ember-data-factory-guy#makelist)
    - mockFindAll( fixture or model name, optional number, optional traits, optional attributes object)
  - Takes modifier method `returns()` for controlling the response payload
    - returns( models / json / ids )
  - Sample acceptance tests using mockFindAll: [users-view-test.js](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/acceptance/users-view-test.js) 

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

##### mockReload
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

- Mocking a failed reload
      
```javascript 
    mockReload('profile', 1).fails();
```

##### mockQuery
  - For dealing with querying for all records for a model type => `store.query(modelType, params)`
    - Takes modifier method `returns()` for controlling the response payload
    - returns( models / json / ids )
   - Takes modifier methods for matching the query params
    - withParams( object )
  - Sample acceptance tests using mockQuery: [user-search-test.js](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/acceptance/user-search-test.js)

Usage: 

```js
  import FactoryGuy, { make, build, buildList, mockQuery } from 'ember-data-factory-guy';
  let store = FactoryGuy.store;

  // This simulates a query that returns no results
  mockQuery('user', {age: 10});

  store.query('user', {age: 10}}).then((userInstances) => {
    /// userInstances will be empty
  })
```

  - with returns( models )
```js
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

```js
  // Create list of models
  let users = buildList('user', 2, 'with_hats');
  let user1 = users.get(0);
  
  mockQuery('user', {name:'Bob', age: 10}).returns({ids: [user1.id]});
  
  store.query('user', {name:'Bob', age: 10}}).then(function(models) {
    // models will be one model and it will be user1
  });

```

##### mockQueryRecord
  - For dealing with querying for one record for a model type => `store.queryRecord(modelType, params)`
    - Takes modifier method `returns()` for controlling the response payload
    - returns( model / json / id )
   - Takes modifier methods for matching the query params
    - withParams( object )


Usage: 

```js
  import FactoryGuy, { make, build, mockQueryRecord } from 'ember-data-factory-guy';
  let store = FactoryGuy.store;

  // This simulates a query that returns no results
  mockQueryRecord('user', {age: 10});

  store.queryRecord('user', {age: 10}}).then((userInstance) => {
    /// userInstance will be empty
  })
```

  - with returns( models )
```js
  // Create model instances
  let user = make('user');
  
  mockQueryRecord('user', {name:'Bob', age: 10}).returns({model: user});
  
  store.queryRecord('user', {name:'Bob', age: 10}}).then((model)=> {
    // model is the same as the user you made
  });
```

  - with returns ( json )
``` js
  // Create json with buildList
  let user = build('user');
  
  mockQueryRecord('user', {name:'Bob', age: 10}).returns({json: user});
  
  store.queryRecord('user', {name:'Bob', age: 10}}).then((model)=> {
    // user model created from the user json
  });
```

  - with returns( ids )

```js
  // Create list of models
  let user = build('user', 'with_hats');
  
  mockQueryRecord('user', {name:'Bob', age: 10}).returns({id: user.get('id')});
  
  store.queryRecord('user', {name:'Bob', age: 10}}).then(function(model) {
    // model will be one model and it will be user1
  });

```

##### mockCreate

  - Use chainable methods to build the response
    - match
      - Attributes that must be in request json
    - returns
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

  // Exactly matching attributes, and returning extra attributes
  mockCreate('project')
    .match({name: "Moo", user: user})
    .returns({created_at: new Date()});

```

  - mocking a failed create

```javascript

  // Mocking failure case is easy with chainable methods, just use #fails
  mockCreate('project').match({name: "Moo"}).fails();

  // Can optionally add a status code and/or errors to the response
  mockCreate('project').fails({status: 422, response: {errors: {name: ['Moo bad, Bahh better']}}});

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

*mocking a failed update and retry with succees*

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



##### mockDelete
  - Need to wrap tests using mockDelete with: Ember.run.function() { 'your test' })

Usage: 

```javascript
  import { make, mockDelete } from 'ember-data-factory-guy';
  
  let profile = make('profile');
  mockDelete('profile', profile.id);

  profile.destroyRecord() // => will succeed
````

  - mocking a failed delete

```javascript
  mockDelete('profile', profile.id, false);

  profile.destroyRecord() // => will fail
````


##### Sample Acceptance test [(user-view-test.js):](https://github.com/danielspaniel/ember-data-factory-guy/blob/master/tests/acceptance/user-view-test.js)


```javascript
// file: tests/acceptance/user-view-test.js

import { make, mockCreate, mockSetup, mockTeardown } from 'ember-data-factory-guy';
import moduleForAcceptance from '../helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | User View', {
  beforeEach: function () {
    // mockSetup sets $.mockjaxSettings response time to zero ( speeds up tests )
    mockSetup();
  },
  afterEach: function () {
      // mockTeardown calls $.mockjax.clear() which resets all the mockjax handlers
    mockTeardown();
  }
});

test("Creates new project", function () {
  let user = build('user', 'with_projects'); // build user payload
  visit('/user/'+ user.get('id'));

  andThen(function () {
    let newProjectName = "Gonzo Project";

    fillIn('input.project-name', newProjectName);

    // Remember, this is for handling an exact match, if you did not care about
    // matching attributes, you could just do: mockCreate('project')
    mockCreate('project', {match: {name: newProjectName, user: user}});

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
