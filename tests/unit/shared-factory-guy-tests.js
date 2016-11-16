import Ember from 'ember';
import FactoryGuy, { make, makeList, build, buildList } from 'ember-data-factory-guy';

import User from 'dummy/models/user';
import BigHat from 'dummy/models/big-hat';
import SmallHat from 'dummy/models/small-hat';
import Outfit from 'dummy/models/outfit';

let SharedBehavior = {};

SharedBehavior.makeTests = function () {

  test("creates records in the store", function () {
    let user = make('user');
    ok(user instanceof User);

    let storeUser = FactoryGuy.store.peekRecord('user', user.id);
    ok(storeUser === user);
  });

  test("handles custom attribute type attributes", function () {
    let info = {first: 1};
    let user = make('user', {info: info});
    ok(user.get('info') === info);
  });

  test("handles camelCase attributes", function () {
    let profile = make('profile', {camelCaseDescription: 'description'});
    ok(profile.get('camelCaseDescription') === 'description');
  });

  test("with model that has attribute keys defined in serializer attrs", function() {
    let cat = make('cat');

    equal(cat.get('name'), 'Cat 1');
    equal(cat.get('friend'), 'Friend 1');
  });

  test("with model that has primaryKey defined in serializer ( FactoryGuy sets id value )", function() {
    let cat = make('cat');

    equal(cat.get('id'), 1);
  });

  test("with model that has primaryKey defined in serializer ( user sets id value )", function() {
    let cat = make('cat', {catId: 'meow1'});

    equal(cat.get('id'), 'meow1');
  });

  test("with model that has primaryKey defined in serializer and is attribute ( value set in fixture )", function() {
    let dog = make('dog');

    equal(dog.get('id'), 'Dog1', 'primary key comes from dogNumber');
    equal(dog.get('dogNumber'), 'Dog1', 'attribute has the primary key value as well');
  });

  test("with fixture options", function () {
    let profile = make('profile', {description: 'dude'});
    ok(profile.get('description') === 'dude');
  });

  test("with attributes in traits", function () {
    let profile = make('profile', 'goofy_description');
    ok(profile.get('description') === 'goofy');
  });

  test("with attributes in traits and fixture options ", function () {
    let profile = make('profile', 'goofy_description', {description: 'dude'});
    ok(profile.get('description') === 'dude');
  });

  test("when hasMany associations assigned, belongTo parent is assigned", function () {
    let project = make('project');
    let user = make('user', {projects: [project]});
    ok(project.get('user') === user);
  });


  test("when hasMany ( asnyc ) associations assigned, belongTo parent is assigned", function (assert) {
    Ember.run(function () {
      let done = assert.async();

      let user = make('user');
      let company = make('company', {users: [user]});

      user.get('company').then(function (c) {
        ok(c === company);
        done();
      });
    });
  });


  test("when hasMany ( polymorphic ) associations are assigned, belongTo parent is assigned", function () {
    let bh = make('big-hat');
    let sh = make('small-hat');
    let user = make('user', {hats: [bh, sh]});

    equal(user.get('hats.length'), 2);
    ok(user.get('hats.firstObject') instanceof BigHat);
    ok(user.get('hats.lastObject') instanceof SmallHat);
    // sets the belongTo user association
    ok(bh.get('user') === user);
    ok(sh.get('user') === user);
  });


  test("when hasMany ( self referential ) associations are assigned, belongsTo parent is assigned", function () {
    let big_group = make('big-group');
    let group = make('group', {versions: [big_group]});
    ok(big_group.get('group') === group);
  });


  test("when hasMany associations are assigned, belongsTo parent is assigned using inverse", function () {
    let project = make('project');
    let project2 = make('project', {children: [project]});

    ok(project.get('parent') === project2);
  });


  test("when hasMany associations are assigned, belongsTo parent is assigned using actual belongsTo name", function () {
    let silk = make('silk');
    let bigHat = make('big-hat', {materials: [silk]});

    ok(silk.get('hat') === bigHat);
  });


  test("when hasMany associations are assigned, belongsTo ( polymorphic ) parent is assigned", function () {
    let fluff = make('fluffy-material');
    let bigHat = make('big-hat', {fluffyMaterials: [fluff]});

    ok(fluff.get('hat') === bigHat);
  });


  test("when belongTo parent is assigned, parent adds to hasMany records", function () {
    let user = make('user');
    let project1 = make('project', {user: user});
    let project2 = make('project', {user: user});

    equal(user.get('projects.length'), 2);
    ok(user.get('projects.firstObject') === project1);
    ok(user.get('projects.lastObject') === project2);
  });


  test("when belongTo parent is assigned, parent adds to polymorphic hasMany records", function () {
    let user = make('user');
    make('big-hat', {user: user});
    make('small-hat', {user: user});

    equal(user.get('hats.length'), 2);
    ok(user.get('hats.firstObject') instanceof BigHat);
    ok(user.get('hats.lastObject') instanceof SmallHat);
  });


  test("when hasMany ( async ) relationship is assigned, model relationship is synced on both sides", function (assert) {
    Ember.run(function () {
      let done = assert.async();

      let property = make('property');
      let user1 = make('user', {properties: [property]});
      let user2 = make('user', {properties: [property]});

      equal(property.get('owners.length'), 2);
      ok(property.get('owners.firstObject') === user1);
      ok(property.get('owners.lastObject') === user2);
      done();
    });
  });


  test("when belongsTo ( async ) parent is assigned, parent adds to hasMany records", function (assert) {
    Ember.run(function () {
      let done = assert.async();

      let company = make('company');
      let user1 = make('user', {company: company});
      let user2 = make('user', {company: company});

      equal(company.get('users.length'), 2);
      ok(company.get('users.firstObject') === user1);
      ok(company.get('users.lastObject') === user2);
      done();
    });
  });


  test("when belongTo parent is assigned, parent adds to hasMany record using inverse", function () {
    let project = make('project');
    let project2 = make('project', {parent: project});

    equal(project.get('children.length'), 1);
    ok(project.get('children.firstObject') === project2);
  });


  test("when belongTo parent is assigned, parent adds to hasMany record using actual hasMany name", function () {
    let bh = make('big-hat');
    let silk = make('silk', {hat: bh});

    ok(bh.get('materials.firstObject') === silk);
  });


  test("when belongTo parent is assigned, parent adds to belongsTo record", function () {
    let company = make('company');
    let profile = make('profile', {company: company});
    ok(company.get('profile') === profile);

    // but guard against a situation where a model can belong to itself
    // and do not want to set the belongsTo on this case.
    let hat1 = make('big-hat');
    let hat2 = make('big-hat', {hat: hat1});
    ok(hat1.get('hat') === null);
    ok(hat2.get('hat') === hat1);
  });

  test("belongTo ( polymorphic ) association assigned in optional attributes", function () {
    let small_hat = make('small-hat');
    let feathers = make('feathers', {hat: small_hat});
    ok(feathers.get('hat') instanceof SmallHat);
  });

  test("belongTo ( polymorphic ) association assigned from traits", function () {
    let feathers = make('feathers', 'belonging_to_hat');
    ok(feathers.get('hat') instanceof SmallHat);
  });

  test("belongsTo associations defined as attributes in fixture", function () {
    let project = make('project_with_user');
    equal(project.get('user') instanceof User, true);
    ok(project.get('user.name') === 'User1');

    project = make('project_with_dude');
    ok(project.get('user.name') === 'Dude');

    project = make('project_with_admin');
    ok(project.get('user.name') === 'Admin');
  });


  test("hasMany associations defined as attributes in fixture", function () {
    let user = make('user_with_projects');
    equal(user.get('projects.length'), 2);
    ok(user.get('projects.firstObject.user') === user);
    ok(user.get('projects.lastObject.user') === user);
  });


  test("hasMany associations defined with traits", function () {
    let user = make('user', 'with_projects');
    equal(user.get('projects.length'), 2);
    ok(user.get('projects.firstObject.user') === user);
    ok(user.get('projects.lastObject.user') === user);
  });


  test("belongsTo associations defined with traits", function () {
    let hat1 = make('hat', 'with_user');
    equal(hat1.get('user') instanceof User, true);

    let hat2 = make('hat', 'with_user', 'with_outfit');
    equal(hat2.get('user') instanceof User, true);
    equal(hat2.get('outfit') instanceof Outfit, true);
  });


  test("with (nested json fixture) belongsTo has a hasMany association which has a belongsTo", function () {
    let project = make('project', 'with_user_having_hats_belonging_to_outfit');
    let user = project.get('user');
    let hats = user.get('hats');
    let firstHat = hats.get('firstObject');
    let lastHat = hats.get('lastObject');

    ok(user.get('projects.firstObject') === project);
    ok(firstHat.get('user') === user);
    ok(firstHat.get('outfit.id') === '1');
    ok(firstHat.get('outfit.hats.length') === 1);
    ok(firstHat.get('outfit.hats.firstObject') === firstHat);

    ok(lastHat.get('user') === user);
    ok(lastHat.get('outfit.id') === '2');
    ok(lastHat.get('outfit.hats.length') === 1);
    ok(lastHat.get('outfit.hats.firstObject') === lastHat);
  });


  test("using afterMake with transient attributes in definition", function () {
    Ember.run(function () {
      let property = FactoryGuy.make('property');
      ok(property.get('name') === 'Silly property(FOR SALE)');
    });
  });

  test("using afterMake with transient attributes in options", function () {
    Ember.run(function () {
      let property = FactoryGuy.make('property', {for_sale: false});
      ok(property.get('name') === 'Silly property');
    });
  });

  test("afterMake is called before the model's onLoad hook", function(assert) {
    assert.expect(2);
    Ember.run(function() {
      let property = FactoryGuy.make('model-with-onload', {name: 'name'});
      equal(property.get('name'), 'name -set in afterMake-', `afterMake is called and sets name`);
      equal(property.get('derivedName'), 'name -set in afterMake- -set in model#didLoad-', `afterMake should be called before the model's didLoad hook`);
    });
  });

  test("hasMany associations assigned with ids", function () {
    let project1 = make('project', {id: 1, title: 'Project One'});
    let project2 = make('project', {id: 2, title: 'Project Two'});
    let user = make('user', {projects: [1, 2]});
    equal(project2.get('user'), user);
    equal(user.get('projects').objectAt(0), project1);
    equal(user.get('projects.lastObject.title'), 'Project Two');
  });

  test("belongsTo association assigned by id", function () {
    let user = make('user', {id: 1});
    let project = make('project', {title: 'The Project', user: 1});
    equal(project.get('user'), user);
    equal(user.get('projects').objectAt(0), project);
    equal(user.get('projects.firstObject.title'), 'The Project');
  });

  test("hasMany associations assigned with id's throws error if relationship is polymorphic", function () {
    make('small-hat', {id: 1});
     make('big-hat', {id: 2});
    throws(function () {
      make('user', {hats: [1, 2]});
    });
  });

  test("belongsTo association by id throws error if relationship is polymorphic", function () {
    make('hat', {id: 1});
    throws(function () {
      make('hat', {hat: 1});
    });
  });

};

SharedBehavior.makeListTests = function () {

  test("creates list of DS.Model instances", function () {
    let users = FactoryGuy.makeList('user', 2);
    equal(users.length, 2);
    ok(users[0] instanceof User);
    ok(users[1] instanceof User);
    equal(FactoryGuy.store.peekAll('user').get('content').length, 2);
  });

  test("handles trait arguments", function () {
    let users = FactoryGuy.makeList('user', 2, 'with_hats');
    equal(users.length, 2);
    equal(users[0].get('hats.length') === 2, true);
  });

  test("handles traits and optional fixture arguments", function () {
    let users = FactoryGuy.makeList('user', 2, 'with_hats', {name: 'Bob'});
    equal(users[0].get('name'), 'Bob');
    equal(users[0].get('hats.length') === 2, true);
  });

};


SharedBehavior.buildListJSONAPITests = function () {

  test("basic", function () {
    let userList = buildList('user', 2);
    deepEqual(userList, {
      data: [{
        id: 1,
        type: 'user',
        attributes: {
          name: 'User1',
          style: "normal"
        }
      },
        {
          id: 2,
          type: 'user',
          attributes: {
            name: 'User2',
            style: "normal"
          }
        }]
    });
  });

  test("using custom attributes", function () {
    let userList = buildList('user', 1, {name: 'Crazy'});
    deepEqual(userList, {
        data: [{
          id: 1,
          type: 'user',
          attributes: {
            name: 'Crazy',
            style: "normal"
          }
        },
        ]
      }
    );
  });


  test("using traits", function () {
    let projectList = buildList('project', 1, 'big');
    deepEqual(projectList, {
      data: [{
        id: 1,
        type: 'project',
        attributes: {
          title: 'Big Project'
        }
      }]
    });
  });


  test("using traits and custom attributes", function () {
    let projectList = buildList('project', 1, 'big', {title: 'Really Big'});
    deepEqual(projectList, {
      data: [{
        id: 1,
        type: 'project',
        attributes: {
          title: 'Really Big'
        }
      }]
    });

  });

};


export default SharedBehavior;
