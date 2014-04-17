# Using as Gem

To Use with in Rails project or project with sprockets:

In Gemfile:

```ruby
gem 'ember-data-fixture-factory', group: test
```

then:

```
$ bundle install
```

# How this works

Add fixtures to the store using the:

  * DS.FixtureAdapter
  * DS.RestAdapter
  * DS.ActiveModelAdapter

```javascript

  ////////////////////////////////////////////
  // Model definitions

  User = DS.Model.extend({
    name:     DS.attr 'string',
    projects: DS.hasMany 'project'
  })

  Project = DS.Model.extend({
    title: DS.attr 'string'
  })

  ////////////////////////////////////////////
  // Fixture definitions for models

  FactoryGuy.define('user', {
   // default values for 'user' attributes
    default: {
      name: 'User1'
    },
    // named 'user' type with custom attributes
    admin: {
      name: 'Admin'
    }
  });

  FactoryGuy.define('project', {
    default: {title: 'Project'}
  });

  //////////////////////////////////////////////////////////////////
  // with any adapter
  var userJson = FactoryGuy.build('user') // {id: 1, name: 'User1'}
  var customUserJson = FactoryGuy.build('user', name: 'bob') // {id: 2, name: 'bob'}
  var namedUserJson = FactoryGuy.build('admin') // {id: 3, name: 'Admin'}

  //////////////////////////////////////////////////////////////////
  //  store.makeFixture method builds json and creates model
  //
  // with DS.Fixture adapter
  //
  store.makeFixture('user') //  user.FIXTURES = {id: 1, name: 'User1'}
  store.makeFixture('user', {name: 'bob'}) //  user.FIXTURES = {id: 2, name: 'bob'}
  store.makeFixture('admin') //  user.FIXTURES = {id: 3, name: 'Admin'}
  store.makeFixture('admin', name: 'My name') //  user.FIXTURES = {id: 4, name: 'My name'}

  store.find('user', 1) // user.get('name') == 'My name'


```