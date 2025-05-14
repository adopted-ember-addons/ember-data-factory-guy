import { test } from 'qunit';
import FactoryGuy, {
  buildList,
  make,
  makeList,
  makeNew,
} from 'ember-data-factory-guy';

import User from 'test-app/models/user';
import BigHat from 'test-app/models/big-hat';
import SmallHat from 'test-app/models/small-hat';
import Outfit from 'test-app/models/outfit';

let SharedBehavior = {};

SharedBehavior.makeNewTests = function () {
  test('handles belongsTo relationships', function (assert) {
    let company = make('company'),
      profile = makeNew('profile', { company });
    assert.strictEqual(profile.get('company'), company, 'belongsTo company');
  });

  test('handles hasMany relationships', function (assert) {
    let projects = makeList('project', 1),
      user = makeNew('user', { projects });
    assert.deepEqual(
      user.get('projects').slice(),
      projects.slice(),
      'hasMany projects',
    );
  });
};

SharedBehavior.makeTests = function () {
  test('creates records in the store', function (assert) {
    let user = make('user');
    assert.ok(user instanceof User);

    let storeUser = FactoryGuy.store.peekRecord('user', user.id);
    assert.ok(storeUser === user);
  });

  test('handles custom attribute type attributes', function (assert) {
    let info = { first: 1 };
    let user = make('user', { info: info });
    assert.ok(user.get('info') === info);
  });

  test('handles camelCase attributes', function (assert) {
    let profile = make('profile', { camelCaseDescription: 'description' });
    assert.ok(profile.get('camelCaseDescription') === 'description');
  });

  test('with model that has attribute keys defined in serializer attrs', function (assert) {
    let cat = make('cat');

    assert.strictEqual(cat.get('name'), 'Cat 1');
    assert.strictEqual(cat.get('friend'), 'Friend 1');
  });

  test('with model that has primaryKey defined in serializer ( FactoryGuy sets id value )', function (assert) {
    let cat = make('cat');

    assert.strictEqual(cat.get('id'), '1');
  });

  test('with model that has primaryKey defined in serializer ( user sets id value )', function (assert) {
    let cat = make('cat', { catId: 'meow1' });

    assert.strictEqual(cat.get('id'), 'meow1');
  });

  test('with model that has primaryKey defined in serializer and is attribute ( value set in fixture )', function (assert) {
    let dog = make('dog');

    assert.strictEqual(
      dog.get('id'),
      'Dog1',
      'primary key comes from dogNumber',
    );
    assert.strictEqual(
      dog.get('dogNumber'),
      'Dog1',
      'attribute has the primary key value as well',
    );
  });

  test('with fixture options', function (assert) {
    let profile = make('profile', { description: 'dude' });
    assert.ok(profile.get('description') === 'dude');
  });

  test('with attributes in traits', function (assert) {
    let profile = make('profile', 'goofy_description');
    assert.ok(profile.get('description') === 'goofy');
  });

  test('with attributes in traits and fixture options ', function (assert) {
    let profile = make('profile', 'goofy_description', { description: 'dude' });
    assert.ok(profile.get('description') === 'dude');
  });

  test('when hasMany associations assigned, belongTo parent is assigned', function (assert) {
    let project = make('project');
    let user = make('user', { projects: [project] });
    assert.ok(project.get('user') === user);
  });

  test('when hasMany ( asnyc ) associations assigned, belongTo parent is assigned', async function (assert) {
    let user = make('user');
    let company = make('company', { users: [user] });

    const c = await user.get('company');

    assert.ok(c === company);
  });

  test('when hasMany ( polymorphic ) associations are assigned, belongTo parent is assigned', function (assert) {
    let bh = make('big-hat');
    let sh = make('small-hat');
    let user = make('user', { hats: [bh, sh] });

    assert.strictEqual(user.hats.length, 2);
    assert.ok(user.hats[0] instanceof BigHat);
    assert.ok(user.hats[1] instanceof SmallHat);
    // sets the belongTo user association
    assert.ok(bh.get('user') === user);
    assert.ok(sh.get('user') === user);
  });

  test('when hasMany ( self referential ) associations are assigned, belongsTo parent is assigned', function (assert) {
    let big_group = make('big-group');
    let group = make('group', { versions: [big_group] });
    assert.ok(big_group.get('group') === group);
  });

  test('when hasMany associations are assigned, belongsTo parent is assigned using inverse', function (assert) {
    let project = make('project');
    let project2 = make('project', { children: [project] });

    assert.ok(project.get('parent') === project2);
  });

  test('when hasMany associations are assigned, belongsTo parent is assigned using actual belongsTo name', function (assert) {
    let silk = make('silk');
    let bigHat = make('big-hat', { materials: [silk] });

    assert.ok(silk.get('hat') === bigHat);
  });

  test('when hasMany associations are assigned, belongsTo ( polymorphic ) parent is assigned', function (assert) {
    let fluff = make('fluffy-material');
    let bigHat = make('big-hat', { fluffyMaterials: [fluff] });

    assert.ok(fluff.get('hat') === bigHat);
  });

  test('when belongTo parent is assigned, parent adds to hasMany records', function (assert) {
    let user = make('user');
    let project1 = make('project', { user: user });
    let project2 = make('project', { user: user });

    assert.strictEqual(user.projects.length, 2);
    assert.ok(user.projects[0] === project1);
    assert.ok(user.projects[1] === project2);
  });

  test('when belongTo parent is assigned, parent adds to polymorphic hasMany records', function (assert) {
    let user = make('user');
    make('big-hat', { user: user });
    make('small-hat', { user: user });

    assert.strictEqual(user.hats.length, 2);
    assert.ok(user.hats[0] instanceof BigHat);
    assert.ok(user.hats[1] instanceof SmallHat);
  });

  test('when hasMany ( async ) relationship is assigned, model relationship is synced on both sides', async function (assert) {
    let property = make('property');
    let user1 = make('user', { properties: [property] });
    let user2 = make('user', { properties: [property] });

    const owners = await property.owners;

    assert.strictEqual(owners.length, 2);
    assert.ok(owners[0] === user1);
    assert.ok(owners[1] === user2);
  });

  test('when belongsTo ( async ) parent is assigned, parent adds to hasMany records', async function (assert) {
    let company = make('company');
    let user1 = make('user', { company: company });
    let user2 = make('user', { company: company });

    const users = await company.users;

    assert.strictEqual(users.length, 2);
    assert.ok(users[0] === user1);
    assert.ok(users[1] === user2);
  });

  test('when belongTo parent is assigned, parent adds to hasMany record using inverse', function (assert) {
    let project = make('project');
    let project2 = make('project', { parent: project });

    assert.strictEqual(project.children.length, 1);
    assert.ok(project.children[0] === project2);
  });

  test('when belongTo parent is assigned, parent adds to hasMany record using actual hasMany name', function (assert) {
    let bh = make('big-hat');
    let silk = make('silk', { hat: bh });

    assert.ok(bh.materials[0] === silk);
  });

  test('when belongTo parent is assigned, parent adds to belongsTo record', function (assert) {
    let company = make('company');
    let profile = make('profile', { company: company });
    assert.ok(company.get('profile') === profile);

    // but guard against a situation where a model can belong to itself
    // and do not want to set the belongsTo on this case.
    let hat1 = make('big-hat');
    let hat2 = make('big-hat', { hat: hat1 });
    assert.ok(hat1.get('hat') === null);
    assert.ok(hat2.get('hat') === hat1);
  });

  test('belongTo ( polymorphic ) association assigned in optional attributes', function (assert) {
    let small_hat = make('small-hat');
    let feathers = make('feathers', { hat: small_hat });
    assert.ok(feathers.get('hat') instanceof SmallHat);
  });

  test('belongTo ( polymorphic ) association assigned from traits', function (assert) {
    let feathers = make('feathers', 'belonging_to_hat');
    assert.ok(feathers.get('hat') instanceof SmallHat);
  });

  test('belongsTo associations defined as attributes in fixture', function (assert) {
    let project = make('project_with_user');
    assert.strictEqual(project.get('user') instanceof User, true);
    assert.ok(project.get('user.name') === 'User1');

    project = make('project_with_dude');
    assert.ok(project.get('user.name') === 'Dude');

    project = make('project_with_admin');
    assert.ok(project.get('user.name') === 'Admin');
  });

  test('hasMany associations defined as attributes in fixture', function (assert) {
    let user = make('user_with_projects');
    assert.strictEqual(user.projects.length, 2);
    assert.ok(user.projects[0].user === user);
    assert.ok(user.projects[1].user === user);
  });

  test('hasMany associations defined with traits', function (assert) {
    let user = make('user', 'with_projects');
    assert.strictEqual(user.projects.length, 2);
    assert.ok(user.projects[0].user === user);
    assert.ok(user.projects[1].user === user);
  });

  test('belongsTo associations defined with traits', function (assert) {
    let hat1 = make('hat', 'with_user');
    assert.strictEqual(hat1.get('user') instanceof User, true);

    let hat2 = make('hat', 'with_user', 'with_outfit');
    assert.strictEqual(hat2.get('user') instanceof User, true);
    assert.strictEqual(hat2.get('outfit') instanceof Outfit, true);
  });

  test('with (nested json fixture) belongsTo has a hasMany association which has a belongsTo', function (assert) {
    let project = make('project', 'with_user_having_hats_belonging_to_outfit');
    let user = project.get('user');
    let hats = user.get('hats');
    let firstHat = hats[0];
    let lastHat = hats[hats.length - 1];

    assert.ok(user.projects[0] === project);
    assert.ok(firstHat.get('user') === user);
    assert.ok(firstHat.get('outfit.id') === '1');
    assert.ok(firstHat.get('outfit.hats.length') === 1);
    assert.ok(firstHat.outfit.hats[0] === firstHat);

    assert.ok(lastHat.get('user') === user);
    assert.ok(lastHat.get('outfit.id') === '2');
    assert.ok(lastHat.get('outfit.hats.length') === 1);
    assert.ok(lastHat.outfit.hats[0] === lastHat);
  });

  test('using afterMake with transient attributes in definition', function (assert) {
    let property = FactoryGuy.make('property');
    assert.ok(property.get('name') === 'Silly property(FOR SALE)');
  });

  test('using afterMake with transient attributes in options', function (assert) {
    let property = FactoryGuy.make('property', { for_sale: false });
    assert.ok(property.get('name') === 'Silly property');
  });

  test('hasMany associations assigned with ids', function (assert) {
    let project1 = make('project', { id: '1', title: 'Project One' });
    let project2 = make('project', { id: '2', title: 'Project Two' });
    let user = make('user', { projects: [1, 2] });
    assert.strictEqual(project2.get('user'), user);
    assert.strictEqual(user.projects[0], project1);
    assert.strictEqual(user.projects[1].title, 'Project Two');
  });

  test('belongsTo association assigned by id', function (assert) {
    let user = make('user', { id: '1' });
    let project = make('project', { title: 'The Project', user: 1 });
    assert.strictEqual(project.user, user);
    assert.strictEqual(user.projects[0], project);
    assert.strictEqual(user.projects[0].title, 'The Project');
  });

  test("hasMany associations assigned with id's throws error if relationship is polymorphic", function (assert) {
    make('small-hat', { id: '1' });
    make('big-hat', { id: '2' });
    assert.throws(function () {
      make('user', { hats: [1, 2] });
    });
  });

  test('belongsTo association by id throws error if relationship is polymorphic', function (assert) {
    make('hat', { id: '1' });
    assert.throws(function () {
      make('hat', { hat: 1 });
    });
  });

  test('with only links for belongsTo relationship', function (assert) {
    const companyLink = '/user/1/company',
      user = make('user', { links: { company: companyLink } });

    assert.strictEqual(user.belongsTo('company').link(), companyLink);
  });

  test('with data and links for belongsTo relationship', function (assert) {
    const company = make('company'),
      companyLink = '/user/1/company',
      user = make('user', { company, links: { company: companyLink } });

    assert.strictEqual(
      user.belongsTo('company').link(),
      companyLink,
      'has link',
    );
    assert.deepEqual(user.get('company.content'), company, 'has model');
  });

  test('with only links for hasMany relationship', function (assert) {
    const propertyLink = '/user/1/properties',
      user = make('user', { links: { properties: propertyLink } });

    assert.strictEqual(user.hasMany('properties').link(), propertyLink);
  });

  test('with data and links for hasMany relationship', async function (assert) {
    const properties = makeList('property', 2),
      propertyLink = '/user/1/properties',
      user = make('user', { properties, links: { properties: propertyLink } });

    assert.strictEqual(
      user.hasMany('properties').link(),
      propertyLink,
      'has link',
    );
    const userProperties = await user.properties;
    assert.deepEqual(userProperties.slice(), properties, 'has models');
  });
};

SharedBehavior.makeListTests = function () {
  test('creates list of DS.Model instances', function (assert) {
    let users = FactoryGuy.makeList('user', 2);
    assert.strictEqual(users.length, 2);
    assert.ok(users[0] instanceof User);
    assert.ok(users[1] instanceof User);
    assert.strictEqual(FactoryGuy.store.peekAll('user').length, 2);
  });

  test('handles trait arguments', function (assert) {
    let users = FactoryGuy.makeList('user', 2, 'with_hats');
    assert.strictEqual(users.length, 2);
    assert.strictEqual(users[0].get('hats.length') === 2, true);
  });

  test('handles traits and optional fixture arguments', function (assert) {
    let users = FactoryGuy.makeList('user', 2, 'with_hats', { name: 'Bob' });
    assert.strictEqual(users[0].get('name'), 'Bob');
    assert.strictEqual(users[0].get('hats.length') === 2, true);
  });
};

SharedBehavior.buildListJSONAPITests = function () {
  test('basic', function (assert) {
    let userList = buildList('user', 2);
    assert.deepEqual(userList, {
      data: [
        {
          id: '1',
          type: 'user',
          attributes: {
            name: 'User1',
            style: 'normal',
          },
        },
        {
          id: '2',
          type: 'user',
          attributes: {
            name: 'User2',
            style: 'normal',
          },
        },
      ],
    });
  });

  test('using custom attributes', function (assert) {
    let userList = buildList('user', 1, { name: 'Crazy' });
    assert.deepEqual(userList, {
      data: [
        {
          id: '1',
          type: 'user',
          attributes: {
            name: 'Crazy',
            style: 'normal',
          },
        },
      ],
    });
  });

  test('using traits', function (assert) {
    let projectList = buildList('project', 1, 'big');
    assert.deepEqual(projectList, {
      data: [
        {
          id: '1',
          type: 'project',
          attributes: {
            title: 'Big Project',
          },
        },
      ],
    });
  });

  test('using traits and custom attributes', function (assert) {
    let projectList = buildList('project', 1, 'big', { title: 'Really Big' });
    assert.deepEqual(projectList, {
      data: [
        {
          id: '1',
          type: 'project',
          attributes: {
            title: 'Really Big',
          },
        },
      ],
    });
  });
};

export default SharedBehavior;
