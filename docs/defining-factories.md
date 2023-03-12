A factory is defined by a name and a set of attributes, with the name helping find the corresponding model. This means
that our `User` model's factory must be named `user`.

Factories are created in the `tests/factories/` directory of your application and can be generated using the followin
command:

```bash
ember generate factory <factory_name>
```

This will create a file with the following path: `tests/factories/<factory_name>.js` with the following content:

```javascript
import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('<factory_name>', {
  default: {},
});
```

The `default` object is used to define the default attributes' values the model will be fed with when created. For our
`user` factory, it would look like:

```javascript
import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('user', {
  default: {
    style: 'normal',
    name: 'Dude',
  },
});
```

Additionally to the `default` object, a factory's attributes can be defined by defining "named" attribute groups as
shortcuts to passing the attributes manually when creating the factory.

```javascript
import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('user', {
  default: {
    style: 'normal',
    name: 'Dude',
  },

  admin: {
    style: 'super',
    name: 'Admin',
  },
});
```

Attributes can also be defined using **traits**, on which we will go through later in this documentation.

> Disabling polymorphism
>
> If your model happens to define a `type` attribute but is not considered a polymorphic model, you will need to enforce
> that on your factory definition by setting the `polymorphic` key to `false`.

```javascript
FactoryGuy.define('cat', {
  polymorphic: false, // Prevent FactoryGuy from treating this model as polymorphic.
  default: {
    type: 'Cute',
    name: (f) => `Cat ${f.id}`,
  },
});
```

## Using sequences

Sequences helps you generate unique attribute values either by declaring them first (useful if you need to use the
sequence for multiple attributes), or by declaring them inline where needed. In both cases, the values are generated
by calling the `FactoryGuy.generate` function.

<!-- tabs:start -->

#### **Shared sequence**

```javascript
import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('user', {
  sequences: {
    userName: (num) => `User #${num}`,
  },
  default: {
    style: 'normal',
    name: FactoryGuy.generate('userName'),
  },
});

const firstUser = FactoryGuy.make('user');
const secondUser = FactoryGuy.make('user');

firstUser.get('name'); // => User #1
secondUser.get('name'); // => User #2
```

#### **Inline sequence**

```javascript
import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('user', {
  default: {
    style: 'normal',
    name: FactoryGuy.generate((num) => `User #${num}`),
  },
});

const firstUser = FactoryGuy.make('user');
const secondUser = FactoryGuy.make('user');

firstUser.get('name'); // => User #1
secondUser.get('name'); // => User #2
```

<!-- tabs:end -->

## Using inline functions

To get more control over the data set for an attribute, you can use a function to declare it. This allows you to add
some logic defining what value should be returned depending on the other attributes of the factory. To do so, the function
is provided with the fixture itself so you can reference all other attributes.

```javascript
FactoryGuy.define('user', {
  default: {
    // The id being almost always a sequential number, you can use it directly in the inline function instead of
    // using a name sequence.
    name: (userFixture) => `User #${userFixture.id}`,
  },
});

const user = FactoryGuy.make('user');

user.get('id'); // => 1
user.get('name'); // => 'User #1'
```

## Defining relationships

Just like with models, you can define relationships in your factories using the `FactoryGuy.belongsTo` and
`FactoryGuy.hasMany` functions. Alike attributes, they can be defined using inline definitions, with traits, but
also as links for async relationships.

Relationships can be used when creating a factory record using the `FactoryGuy.build`, `FactoryGuy.buildList`,
`FactoryGuy.make`, `FactoryGuy.makeNew` and `Factory.makeList` build strategies.

When defining a factory, relationships are better setup using traits like:

<!-- tabs:start -->

### **belongsTo relationships**

```javascript
FactoryGuy.define('project', {
  traits: {
    withUser: { user: FactoryGuy.belongsTo('user') },
    withAdmin: { user: FactoryGuy.belongsTo('user', 'admin') },
    withManagerLink(f) {
      f.links = { manager: `/projects/${f.id}/manager` };
    },
  },
});

const project = make('project', 'withUser');
project.user.toJSON({ includeId: true }); // => {id:1, name: 'Dude', style: 'normal'}

const user = make('user', 'withManagerLink');
user.belongsTo('manager').link(); // => "/projects/1/manager"
```

### **hasMany relationships**

```javascript
FactoryGuy.define('user', {
  traits: {
    withProjects: {
      projects: FactoryGuy.hasMany('project', 2),
    },
    withPropertiesLink(f) {
      f.links = { properties: `/users/${f.id}/properties` };
    },
  },
});

let user = make('user', 'withProjects');
user.get('projects.length'); // => 2

user = make('user', 'withPropertiesLink');
user.hasMany('properties').link(); // => "/users/1/properties"
```

<!-- tabs:end -->

Note that though you are setting the 'projects' hasMany association on a user,
the reverse 'user' belongsTo association is being setup for you on the project
(for both manual and factory defined hasMany associations ) as well.

```javascript
projects.get('firstObject.user'); // => user
```

### Special tips for links

When dealing with models with async relationships, you can setup links for them in your factory definition like:

```javascript
FactoryGuy.define('user', {
  traits: {
    withCompanyLink(f): {
      // since you can assign many different links with different traits,
      // you should Object.assign so that you add to the links hash rather
      // than set it directly ( assuming you want to use this feature )
      f.links = Object.assign({company: `/users/${f.id}/company`}, f.links);
    },
    withPropertiesLink(f) {
      f.links = Object.assign({properties: `/users/${f.id}/properties`}, f.links);
    }
  }
});

// setting links with traits
let company = make('company')
let user = make('user', 'withCompanyLink', 'withPropertiesLink', {company});
user.hasMany('properties').link(); // => "/users/1/properties"
user.belongsTo('company').link(); // => "/users/1/company"
// the company async relationship has a company AND link to fetch it again
// when you reload that relationship
user.get('company.content') // => company
user.belongsTo('company').reload() // would use that link "/users/1/company" to reload company

// you can also set traits with your build/buildList/make/makeList options
user = make('user', {links: {properties: '/users/1/properties'}});
```

## Traits

Traits allow you to group attributes together and then apply them to any factory. There power also resides in that you
can compose your factory by applying multiple traits to it. Traits are declared in the factory's `traits` object.

**Each trait overrides any values defined in traits before it in the argument list.**

```javascript
FactoryGuy.define('user', {
  traits: {
    big: { name: 'Big Guy' },
    friendly: { style: 'Friendly' },
    bfg: { name: 'Big Friendly Giant', style: 'Friendly' },
  },
});

const user = FactoryGuy.make('user', 'big', 'friendly');
const giant = FactoryGuy.make('user', 'big', 'bfg');

user.get('name'); // => 'Big Guy'
user.get('style'); // => 'Friendly'
giant.get('name'); // => 'Big Friendly Giant' - name defined in the 'bfg' trait overrides the name defined in the 'big' trait
giant.get('style'); // => 'Friendly'
```

You can still pass in a hash of attributes when using traits and it will override any trait attributes or default
attributes.

```javascript
let user = FactoryGuy.make('user', 'big', 'friendly', { name: 'Dave' });
user.get('name'); // => 'Dave'
user.get('style'); // => 'Friendly'
```

### Using traits as functions

Alike attributes, traits can be defined using functions too. This is super powerful as it allows you to make your traits
even more dynamic.

```javascript
import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('project', {
  default: {
    title: (f) => `Project ${f.id}`,
  },
  traits: {
    medium: (f) => {
      f.title = `Medium Project ${f.id}`;
    },
    goofy: (f) => {
      f.title = `Goofy ${f.title}`;
    },
    withUser: (f) => {
      // NOTE: In traits, relationships are directly created instead of just declared using FactoryGuy.belongsTo as you
      // would normally in a factory definition.
      f.user = FactoryGuy.make('user');
    },
  },
});

const project = make('project', 'medium');
const project2 = build('project', 'goofy');
const project3 = build('project', 'withUser');

project.get('title'); //=> 'Medium Project 1'
project2.get('title'); //=> 'Goofy Project 2'
project3.get('title'); //=> 'Project #3'
project3.get('user.name'); //=> 'User 1'
```

## Extending Other Definitions

- Extending another definition will inherit these sections:
  - sequences
  - traits
  - default attributes
- Inheritance is fine grained, so in each section, any attribute that is local
  will take precedence over an inherited one. So you can override some
  attributes in the default section ( for example ), and inherit the rest

There is a sample Factory using inheritance here: [`big-group.js`](https://github.com/adopted-ember-addons/ember-data-factory-guy/blob/master/tests/dummy/app/tests/factories/big-group.js)

## Transient Attributes

- Use transient attributes to build a fixture
  - Pass in any attribute you like to build a fixture
  - Usually helps you to build some other attribute
  - These attributes will be removed when fixture is done building
- Can be used in `make`/`makeList`/`build`/`buildList`

Let's say you have a model and a factory like this:

```javascript
// app/models/dog.js
import Model from 'ember-data/model';
import attr from 'ember-data/attr';

export default Model.extend({
  dogNumber: attr('string'),
  sound: attr('string'),
});

// tests/factories/dog.js
import FactoryGuy from 'ember-data-factory-guy';

const defaultVolume = 'Normal';

FactoryGuy.define('dog', {
  default: {
    dogNumber: (f) => `Dog${f.id}`,
    sound: (f) => `${f.volume || defaultVolume} Woof`,
  },
});
```

Then to build the fixture:

```javascript
let dog2 = build('dog', { volume: 'Soft' });

dog2.get('sound'); //=> `Soft Woof`
```

## Callbacks

- `afterMake`
  - Uses transient attributes
  - Unfortunately the model will fire 'onload' event before this `afterMake` is called.
    - So all data will not be setup by then if you rely on `afterMake` to finish by the
      time `onload` is called.
    - In this case, just use transient attributes without the `afterMake`

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
run(function () {
  let property = FactoryGuy.make('property');
  property.get('name'); // => 'Silly property(FOR SALE)')

  let property = FactoryGuy.make('property', { for_sale: false });
  property.get('name'); // => 'Silly property')
});
```

Remember to import the `run` function with `import { run } from "@ember/runloop"`;

## Polymorphic models

- Define each polymorphic model in its own typed definition
- The attribute named `type` is used to hold the model name
- May want to extend the parent factory here (see [extending other definitions](iel/ember-data-factory-guy#extending-other-definitions))

```javascript
// file tests/factories/small-hat.js
import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('small-hat', {
  default: {
    type: 'SmallHat',
  },
});

// file tests/factories/big-hat.js
import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('big-hat', {
  default: {
    type: 'BigHat',
  },
});
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
