Add fixtures to the store using the:

  DS.FixtureAdapter,
  DS.RestAdapter or
  DS.ActiveModelAdapter

```
  user = DS.Model.extend
    name:     DS.attr 'string'
    projects: DS.hasMany 'project'

  project = DS.Model.extend
    title: DS.attr 'string'

  FixtureFactory.define 'user',

    "default": {
      name: 'User1'
    }

    admin: {
      name: 'Admin'
    }

  FixtureFactory.define 'project',
      default: {title: 'Project'}

  fixtureJson = FixtureFactory.build('user') #=> {id: 1, name: 'User1'}
  FixtureFactory.pushFixture(store.modelFor('user'), fixtureJson) #=>  user.FIXTURES = {id: 1, name: 'User1'}

  fixtureJson2 = FixtureFactory.build('admin', name: 'bob') #=> {id: 2, name: 'bob'}

  #build and add to store:
  store.makeFixture('admin', name: 'My name')
  store.find('user', 1) #=> user.get('name') == 'My name'

```