import { moduleFor, test } from 'ember-qunit';
import DS from 'ember-data';
import Ember from 'ember';
import FactoryGuy, { make, makeNew, makeList, build, buildList } from 'ember-data-factory-guy';
import MissingSequenceError from 'ember-data-factory-guy/missing-sequence-error';
import sinon from 'sinon';
import { inlineSetup } from '../helpers/utility-methods';
import User from 'dummy/models/user';
import RequestManager from 'ember-data-factory-guy/mocks/request-manager';

const A = Ember.A;

moduleFor('serializer:application', 'FactoryGuy', inlineSetup('-json-api'));

test("has store set in initializer", function(assert) {
  assert.ok(FactoryGuy.store instanceof DS.Store);
});

test("#settings", function(assert) {
  FactoryGuy.logLevel = 0;
  FactoryGuy.settings({responseTime: 0});

  FactoryGuy.settings({logLevel: 1});
  assert.equal(FactoryGuy.logLevel, 1);

  FactoryGuy.settings({responseTime: 10});
  assert.equal(RequestManager.settings().responseTime, 10);
});

test("exposes make method which is shortcut for FactoryGuy.make", function(assert) {
  assert.ok(make('user') instanceof User);
});

test("exposes makeList method which is shortcut for FactoryGuy.makeList", function(assert) {
  let users = makeList('user', 2);
  assert.equal(users.length, 2);
  assert.ok(users[0] instanceof User);
  assert.ok(users[1] instanceof User);
  assert.equal(FactoryGuy.store.peekAll('user').get('content').length, 2);
});

test("exposes build method which is shortcut for FactoryGuy.build", function(assert) {
  let json = build('user');
  assert.ok(json);
});

test("exposes buildList method which is shortcut for FactoryGuy.buildList", function(assert) {
  let userList = buildList('user', 2);
  assert.ok(userList.data.length === 2);
});

test("#resetDefinitions resets the model definition", function(assert) {
  Ember.run(function() {
    let project = make('project');
    make('user', {projects: [project]});

    let model,
        definition,
        definitions = FactoryGuy.getModelDefinitions();

    for (model in definitions) {
      definition = definitions[model];
      sinon.spy(definition, 'reset');
    }

    FactoryGuy.resetDefinitions();

    for (model in definitions) {
      definition = definitions[model];
      assert.ok(definition.reset.calledOnce);
      definition.reset.restore();
    }
  });
});

moduleFor('serializer:application', 'FactoryGuy#make', inlineSetup('-rest'));

test('throws exception if there is NO store setup', function(assert) {
  FactoryGuy.store = null;
  assert.throws(
    function() {
      make('profile');
    },
    function(err) {
      return !!err.toString().match(/Use manualSetup\(this\) in model\/component test/);
    });
});

test('throws exception if model name is not found', function(assert) {
  assert.throws(
    function() {
      make('BigBobModel');
    },
    function(err) {
      return !!err.toString().match(/\[ember-data-factory-guy\] Can't find that factory named \[ BigBobModel \]/);
    }
  );
});

test("returns a model instance", function(assert) {
  let user = FactoryGuy.make('user');
  assert.ok(user instanceof User);
});

test("returns a json for model fragment", function(assert) {
  let json = FactoryGuy.make('name');
  assert.deepEqual(json, {firstName: 'Tyrion', lastName: 'Lannister'});
});


moduleFor('serializer:application', 'FactoryGuy#hasMany', inlineSetup('-rest'));

//test("with model and buildType 'make'", function(assert) {
//  let hasMany    = FactoryGuy.hasMany('employee', 1),
//      json       = hasMany({}, 'make'),
//      [employee] = json;
//
//  assert.deepEqual(employee.name, {firstName: 'Tyrion', lastName: 'Lannister'});
//});

test("with model with model fragment and buildType 'make'", function(assert) {
  let hasMany    = FactoryGuy.hasMany('employee', 1),
      json       = hasMany({}, 'make'),
      [employee] = json;

  assert.deepEqual(employee.name, {firstName: 'Tyrion', lastName: 'Lannister'});
});

test("with model with model fragment and buildType 'build'", function(assert) {
  let hasMany    = FactoryGuy.hasMany('employee', 1),
      json       = hasMany({}, 'build'),
      [employee] = json;

  assert.deepEqual(employee.name, {first_name: 'Tyrion', last_name: 'Lannister'});
});


moduleFor('serializer:application', 'FactoryGuy#buildURL', inlineSetup('-rest'));

test("without namespace", function(assert) {
  assert.equal(FactoryGuy.buildURL('project'), '/projects', 'has no namespace by default');
});

test("with namespace and host", function(assert) {
  let adapter = FactoryGuy.store.adapterFor('application');
  adapter.setProperties({
    host: 'https://dude.com',
    namespace: 'api/v1'
  });

  assert.equal(FactoryGuy.buildURL('project'), 'https://dude.com/api/v1/projects');
});


moduleFor('serializer:application', 'FactoryGuy#build', inlineSetup('-rest'));

test('throws exception if model name is not found', function(assert) {
  assert.throws(
    function() {
      build('BigBobModel');
    },
    function(err) {
      return !!err.toString().match(/\[ember-data-factory-guy\] Can't find that factory named \[ BigBobModel \]/);
    }
  );
});

test("with one level of hasMany relationship", function(assert) {
  let hats = buildList('big-hat', 2);
  let user = build('user', {hats: hats});

  assert.ok(user['user']);
  assert.equal(user['big-hats'].length, 2);
});

test("when hasMany relationship is null", function(assert) {
  let user = build('user', {hats: null});

  assert.ok(user['user'], 'have user info');
  assert.notOk(user['big-hats'], 'hasMany does not exist');
});

test("can use non model attributes to help setup attributes", function(assert) {
  let dog1 = build('dog');
  assert.equal(dog1.get('sound'), 'Normal Woof', 'no extra attribute');

  let volume = 'Soft';
  let dog2 = build('dog', {volume});

  assert.equal(dog2.get('sound'), `${volume} Woof`, 'uses your extra attribute');
});

test("causes an assertion error when a trait is not found", function(assert) {
  try {
    build('user', 'non_existent_trait');
  } catch (error) {
    assert.ok(error.message.match(/\[ember-data-factory-guy\] You're trying to use a trait \[non_existent_trait\]/));
  }
});

test("handles hash attribute with hash value as default value", function(assert) {
  let dog = build('dog');
  assert.deepEqual(dog.get('tag'), {num: 1});
});

test("handles hash attribute with hash value in options", function(assert) {
  let dog = build('dog', {tag: {num: 10}});
  assert.deepEqual(dog.get('tag'), {num: 10});
});

moduleFor('serializer:application', 'FactoryGuy#buildList', inlineSetup('-rest'));

test('throws exception if arguments are missing the model name', function(assert) {
  assert.throws(
    function() {
      buildList();
    },
    function(err) {
      return !!err.toString().match(/\[ember-data-factory-guy\] buildList needs at least a name/);
    }
  );
});

test('throws exception if model name is not found', function(assert) {
  assert.throws(
    function() {
      buildList('BigBobModel');
    },
    function(err) {
      return !!err.toString().match(/\[ember-data-factory-guy\] Can't find that factory named \[ BigBobModel \]/);
    }
  );
});

test("without a number returns a empty json payload", function(assert) {
  let users = buildList('user');
  assert.equal(users.get().length, 0);
});

test("without a number but with options returns array with diverse attributes", function(assert) {
  let profiles = buildList('profile', 'goofy_description', ['with_company', {description: 'Noodles'}], 'with_bat_man');
  assert.equal(profiles.get().length, 3);
  assert.ok(profiles.get(0).description === 'goofy');
  assert.ok(profiles.get(1).company === 1);
  assert.ok(profiles.get(1).description === 'Noodles');
  assert.ok(profiles.get(2).superHero === 1);
});

test("with a number and extra options", function(assert) {
  let heros = buildList('super-hero', 2, {name: "Bob"});
  assert.equal(heros.get().length, 2);
  assert.equal(heros.get(0).name, "Bob");
  assert.equal(heros.get(1).name, "Bob");
});


moduleFor('serializer:application', 'FactoryGuy#makeNew', inlineSetup('-json-api'));

test('throws exception if model name is not found', function(assert) {
  assert.throws(
    function() {
      makeNew('BigBobModel');
    },
    function(err) {
      return !!err.toString().match(/\[ember-data-factory-guy\] Can't find that factory named \[ BigBobModel \]/);
    }
  );
});

test("creates record but does not save to store", function(assert) {
  let user = makeNew('user', 'silly', {name: 'Bozo'});
  assert.ok(user instanceof User, 'creates record');
  assert.equal(user.get('style'), 'silly', 'uses trait attributes');
  assert.equal(user.get('name'), 'Bozo', 'uses optional attributes');
  assert.equal(user.id, null, 'no id');
  assert.ok(user.get('isNew'), 'is in isNew state');
});

test("handles camelCase and snake case attributes", function(assert) {
  let profile = makeNew('profile', {
    camelCaseDescription: 'camelMan',
    snake_case_description: 'snakeMan'
  });
  assert.equal(profile.get('camelCaseDescription'), 'camelMan', 'camel case');
  assert.equal(profile.get('snake_case_description'), 'snakeMan', 'snake case');
});

moduleFor('serializer:application', 'FactoryGuy#makeList', inlineSetup('-json-api'));

test('throws exception if there is NO store setup', function(assert) {
  FactoryGuy.store = null;
  assert.throws(
    function() {
      makeList('profile');
    },
    function(err) {
      return !!err.toString().match(/Use manualSetup\(this\) in model\/component test/);
    }
  );
});

test('throws exception if arguments are missing the model name', function(assert) {
  assert.throws(
    function() {
      makeList();
    },
    function(err) {
      return !!err.toString().match(/\[ember-data-factory-guy\] makeList needs at least a name/);
    }
  );
});

test('throws exception if model name is not found', function(assert) {
  assert.throws(
    function() {
      makeList('BigBobModel');
    },
    function(err) {
      return !!err.toString().match(/\[ember-data-factory-guy\] Can't find that factory named \[ BigBobModel \]/);
    }
  );
});

test("with number as 0 returns an empty array of model instances", function(assert) {
  let users = makeList('user', 0);
  assert.equal(users.length, 0);
});

test("with number returns that many model instances", function(assert) {
  // important to test on model with NO traits
  let users = makeList('outfit', 2);
  assert.equal(users.length, 2);
});

test("with a number and a trait", function(assert) {
  let users = makeList('user', 2, 'with_hats');
  assert.equal(users.length, 2);
});

test("without a number returns an array of 0 model instances", function(assert) {
  let users = makeList('user');
  assert.equal(users.length, 0);
});

test("without a number but with options returns array of models", function(assert) {
  let profiles = makeList('profile', 'goofy_description', ['with_company', {description: 'Noodles'}], 'with_bat_man');
  assert.equal(profiles.length, 3);
  assert.ok(A(profiles).objectAt(0).get('description') === 'goofy');
  assert.ok(A(profiles).objectAt(1).get('company.name') === 'Silly corp');
  assert.ok(A(profiles).objectAt(1).get('description') === 'Noodles');
  assert.ok(A(profiles).objectAt(2).get('superHero.name') === 'BatMan');
  assert.equal(FactoryGuy.store.peekAll('profile').get('content').length, 3);
});


moduleFor('serializer:application', 'FactoryGuy#define', inlineSetup('-json-api'));

test("default values and sequences are inherited", function(assert) {
  FactoryGuy.define('person', {
    sequences: {
      personName: (i) => `person #${i}`
    },
    default: {
      style: 'normal',
      name: FactoryGuy.generate('personName')
    }
  });

  FactoryGuy.define('philosopher', {
    extends: 'person',
    default: {
      style: 'thinker'
    }
  });

  FactoryGuy.define('stoner', {
    extends: 'person',
    sequences: {
      personName: (i) => `stoner #${i}`
    },
    default: {
      style: 'chill'
    }
  });

  FactoryGuy.define('cool-stoner', {
    extends: 'stoner',
    sequences: {
      personName: (i) => `cool stoner #${i}`
    }
  });

  let json;

  json = FactoryGuy.build('person');
  assert.equal(json.get('name'), 'person #1');

  json = FactoryGuy.build('philosopher');
  // since the sequence ( personName ) that was inherited from person is owned by stoner,
  // the person # starts at 1 again, and is not person #2
  assert.equal(json.get('name'), 'person #1', 'inherits parent default attribute functions and sequences');
  assert.equal(json.get('style'), 'thinker', 'local attributes override parent attributes');

  json = FactoryGuy.build('stoner');
  assert.equal(json.get('name'), 'stoner #1', 'uses local sequence and parent default attribute function with one level of inheritance ');
  assert.equal(json.get('style'), 'chill', 'uses local default attribute with one level of inheritance');

  json = FactoryGuy.build('cool-stoner');
  assert.equal(json.get('name'), 'cool stoner #1', 'uses local sequence and parent default attribute function with two levels of inheritance');
  assert.equal(json.get('style'), 'chill', 'uses inherited default attribute with two levels of inheritance');

});

test("config is not destroyed", function(assert) {
  var config = {
    default: {
      name: 'hi'
    }
  };

  FactoryGuy.define('stoner', config);
  assert.deepEqual(config, {default: {name: 'hi'}});
});

test("using polymorphic:false to use a type attribute name on non polymorphic model", function(assert) {
  let cat = build('cat', {type: 'fluffy'});

  assert.equal(cat.data.type, 'cat');
  assert.equal(cat.get('type'), 'fluffy');
});

test("traits are inherited", function(assert) {
  FactoryGuy.define('person', {
    traits: {
      lazy_style: {style: 'Super Lazy'}
    }
  });

  FactoryGuy.define('stoner', {
    extends: 'person',
    traits: {
      real_name: {name: 'Stoned Guy'}
    }
  });

  let json;

  json = FactoryGuy.build('stoner', 'real_name', 'lazy_style').data;
  assert.equal(json.attributes.style, 'Super Lazy', 'inherits parent traits');
  assert.equal(json.attributes.name, 'Stoned Guy', 'local traits are available');
});


test("named types are not inherited", function(assert) {
  FactoryGuy.define('person', {
    sequences: {
      personType: function(num) {
        return 'person type #' + num;
      }
    },
    dude: {
      type: FactoryGuy.generate('personType')
    }
  });

  FactoryGuy.define('stoner', {
    extends: 'person',
    bif: {
      name: 'Bif'
    },
  });

  let json;

  json = FactoryGuy.build('bif').data;
  assert.equal(json.attributes.name, 'Bif');

  let definition = FactoryGuy.findModelDefinition('stoner');
  assert.equal(definition.matchesName('dude'), undefined);
});

test("id can be a function in default attributes", function(assert) {
  FactoryGuy.define('stoner', {

    sequences: {
      stonerId: (i) => `stoner-${i}`,
    },

    default: {
      id: FactoryGuy.generate('stonerId')
    }
  });

  let json = FactoryGuy.build('stoner').data;
  assert.equal(json.id, 'stoner-1');
});

test("id can be a function in named attributes", function(assert) {
  FactoryGuy.define('stoner', {

    sequences: {
      stonerId: (i) => `stoner-${i}`,
    },

    bif: {
      id: FactoryGuy.generate('stonerId'),
      name: 'Bif'
    }
  });

  let json = FactoryGuy.build('bif').data;
  assert.equal(json.id, 'stoner-1');
});


moduleFor('serializer:application', 'FactoryGuy#buildRaw', inlineSetup('-json-api'));

test("Using sequences", function(assert) {

  FactoryGuy.define('person', {
    sequences: {
      personName: (num) => `person #${num}`,
      personType: (num) => `person type #${num}`
    },
    default: {
      type: 'normal',
      name: FactoryGuy.generate('personName')
    },
    dude: {
      type: FactoryGuy.generate('personType')
    },
    bro: {
      type: FactoryGuy.generate('broType')
    },
    dude_inline: {
      type: FactoryGuy.generate(function(num) {
        return 'Dude #' + num;
      })
    }
  });

  let json = FactoryGuy.buildRaw({name: 'person'});
  let expected = {id: 1, name: 'person #1', type: 'normal'};
  assert.deepEqual(json, expected, 'in default attributes');

  json = FactoryGuy.buildRaw({name: 'dude'});
  expected = {id: 2, name: 'person #2', type: 'person type #1'};
  assert.deepEqual(json, expected, 'in named attributes');

  assert.throws(function() {
      FactoryGuy.buildRaw({name: 'bro'});
    },
    MissingSequenceError,
    "throws error when sequence name not found"
  );

  json = FactoryGuy.buildRaw({name: 'dude_inline'});
  expected = {id: 3, name: 'person #3', type: 'Dude #1'};
  assert.deepEqual(json, expected, 'as inline sequence function #1');


  json = FactoryGuy.buildRaw({name: 'dude_inline'});
  expected = {id: 4, name: 'person #4', type: 'Dude #2'};
  assert.deepEqual(json, expected, 'as inline sequence function #2');
});


test("Referring to other attributes in attribute definition", function(assert) {

  FactoryGuy.define('person', {
    default: {
      name: 'Bob',
      type: 'normal'
    },
    funny_person: {
      type: (f) => `funny ${f.name}`
    },
    index_name: {
      name: (f) => `Person ${f.id}`
    },
    missing_person: {
      type: (f) => `level ${f.brain_size}`
    }
  });

  let json = FactoryGuy.buildRaw({name: 'index_name'});
  let expected = {id: 1, name: 'Person 1', type: 'normal'};
  assert.deepEqual(json, expected, 'id is available');

  json = FactoryGuy.buildRaw({name: 'funny_person'});
  expected = {id: 2, name: 'Bob', type: 'funny Bob'};
  assert.deepEqual(json, expected, 'works when attribute exists');

  json = FactoryGuy.buildRaw({name: 'missing_person'});
  expected = {id: 3, name: 'Bob', type: 'level undefined'};
  assert.deepEqual(json, expected, 'still works when attribute does not exists');
});


test("Using default belongsTo associations in attribute definition", function(assert) {
  let json = FactoryGuy.buildRaw({name: 'project_with_user'});
  let expected = {id: 1, title: 'Project1', user: {id: 1, name: 'User1', style: "normal"}};
  assert.deepEqual(json, expected);
});

test("creates association with optional attributes", function(assert) {
  let json = FactoryGuy.buildRaw({name: 'project_with_dude'});
  let expected = {
    id: 1,
    title: 'Project1',
    user: {id: 1, name: 'Dude', style: "normal"}
  };
  assert.deepEqual(json, expected);
});


test("creates association using named attribute", function(assert) {
  let json = FactoryGuy.buildRaw({name: 'project_with_admin'});
  let expected = {
    id: 1,
    title: 'Project1',
    user: {id: 1, name: 'Admin', style: "super"}
  };
  assert.deepEqual(json, expected);
});


test("belongsTo association name differs from model name", function(assert) {
  let json = FactoryGuy.buildRaw({name: 'project_with_parent'});
  let expected = {
    id: 1,
    title: 'Project1',
    parent: {id: 2, title: 'Project2'}
  };
  assert.deepEqual(json, expected);
});


test("Using hasMany associations in attribute definition", function(assert) {
  let json = FactoryGuy.buildRaw({name: 'user_with_projects'});
  let expected = {
    id: 1,
    name: 'User1',
    style: "normal",
    projects: [{id: 1, title: 'Project1'}, {id: 2, title: 'Project2'}]
  };
  assert.deepEqual(json, expected);
});


test("with traits defining model attributes", function(assert) {
  let json = FactoryGuy.buildRaw({name: 'project', traits: ['big']});
  let expected = {id: 1, title: 'Big Project'};
  assert.deepEqual(json, expected);
});

test("with traits that are functions", function(assert) {
  let json = FactoryGuy.buildRaw({name: 'project', traits: ['medium']});
  let expected = {id: 1, title: 'Medium Project 1'};
  assert.deepEqual(json, expected);
});

test("with traits defining belongsTo association", function(assert) {
  let json = FactoryGuy.buildRaw({name: 'project', traits: ['with_user']});
  let expected = {
    id: 1, title: 'Project1', user: {id: 1, name: 'User1', style: "normal"}
  };
  assert.deepEqual(json, expected);
});

test("with more than one trait used", function(assert) {
  let json = FactoryGuy.buildRaw({name: 'project', traits: ['big', 'with_user']});
  let expected = {
    id: 1, title: 'Big Project',
    user: {id: 1, name: 'User1', style: "normal"}
  };
  assert.deepEqual(json, expected);
});

test("with more than one trait and custom attributes", function(assert) {
  let json = FactoryGuy.buildRaw({name: 'project', traits: ['big', 'with_user'], opts: {title: 'Crazy Project'}});
  let expected = {
    id: 1,
    title: 'Crazy Project',
    user: {id: 1, name: 'User1', style: "normal"}
  };
  assert.deepEqual(json, expected);
});

test("with trait with custom belongsTo association object", function(assert) {
  let json = FactoryGuy.buildRaw({name: 'project', traits: ['big', 'with_dude']});
  let expected = {
    id: 1,
    title: 'Big Project',
    user: {id: 1, name: 'Dude', style: "normal"}
  };
  assert.deepEqual(json, expected);
});

test("using trait with association using FactoryGuy.belongsTo method", function(assert) {
  let json = FactoryGuy.buildRaw({name: 'project', traits: ['with_admin']});
  let expected = {
    id: 1,
    title: 'Project1',
    user: {id: 1, name: 'Admin', style: "super"}
  };
  assert.deepEqual(json, expected);
});

test("with attribute using sequence", function(assert) {
  let json = FactoryGuy.buildRaw({name: 'project', traits: ['with_title_sequence']});
  let expected = {id: 1, title: 'Project1'};
  assert.deepEqual(json, expected);
});

test("with trait defining association using FactoryGuy.hasMany method", function(assert) {
  let json = FactoryGuy.buildRaw({name: 'user', traits: ['with_projects']});
  let expected = {
    id: 1,
    name: 'User1',
    style: "normal",
    projects: [{id: 1, title: 'Project1'}, {id: 2, title: 'Project2'}]
  };
  assert.deepEqual(json, expected);
});

test("with trait defining association using FactoryGuy.hasMany method that uses splat style attributes", function(assert) {
  let json = FactoryGuy.buildRaw({name: 'user', traits: ['with_projects_splat']});
  let expected = {
    id: 1,
    name: 'User1',
    style: "normal",
    projects: [
      {id: 1, title: 'Big Project'},
      {id: 2, title: 'Small Project'},
      {id: 3, title: 'Cool Project'}
    ]
  };
  assert.deepEqual(json, expected);
});

test("creates default json for model", function(assert) {
  let json = FactoryGuy.buildRaw({name: 'user'});
  let expected = {id: 1, name: 'User1', style: "normal"};
  assert.deepEqual(json, expected);
});


test("can override default model attributes", function(assert) {
  let json = FactoryGuy.buildRaw({name: 'user', opts: {name: 'bob'}});
  let expected = {id: 1, name: 'bob', style: "normal"};
  assert.deepEqual(json, expected);
});


test("with named model definition with custom attributes", function(assert) {
  let json = FactoryGuy.buildRaw({name: 'admin'});
  let expected = {id: 1, name: 'Admin', style: "super"};
  assert.deepEqual(json, expected);
});


test("overrides named model attributes", function(assert) {
  let json = FactoryGuy.buildRaw({name: 'admin', opts: {name: 'AdminGuy'}});
  let expected = {id: 1, name: 'AdminGuy', style: "super"};
  assert.deepEqual(json, expected);
});


test("ignores transient attributes", function(assert) {
  let json = FactoryGuy.buildRaw({name: 'property'});
  let expected = {id: 1, name: 'Silly property'};
  assert.deepEqual(json, expected);
});

test("removes id for model fragment attribute", function(assert) {
  let json = FactoryGuy.buildRaw({name: 'manager'});
  assert.deepEqual(json.name.id, undefined);
});

test("removes id for model fragmentArray attribute", function(assert) {
  let json = FactoryGuy.buildRaw({name: 'employee', traits: ['with_department_employments']});
  let ids = Ember.A(json.departmentEmployments.map((obj) => obj.id)).compact();
  assert.deepEqual(ids, []);
});


moduleFor('serializer:application', 'FactoryGuy#buildRawList', inlineSetup('-json-api'));

test("basic", function(assert) {
  let userList = FactoryGuy.buildRawList({name: 'user', number: 2, opts: []});
  let expected = [
    {id: 1, name: 'User1', style: "normal"},
    {id: 2, name: 'User2', style: "normal"}
  ];
  assert.deepEqual(userList, expected);
});

test("using custom attributes", function(assert) {
  let userList = FactoryGuy.buildRawList({
    name: 'user',
    number: 2,
    opts: [
      {name: 'Crazy'}
    ]
  });
  let expected = [
    {id: 1, name: 'Crazy', style: "normal"},
    {id: 2, name: 'Crazy', style: "normal"}
  ];
  assert.deepEqual(userList, expected);
});

test("using traits", function(assert) {
  let projectList = FactoryGuy.buildRawList({
    name: 'project',
    number: 2,
    opts: ['big']
  });
  let expected = [
    {id: 1, title: 'Big Project'},
    {id: 2, title: 'Big Project'}
  ];
  assert.deepEqual(projectList, expected);
});

test("using traits and custom attributes", function(assert) {
  let projectList = FactoryGuy.buildRawList({
    name: 'project',
    number: 2,
    opts: ['big', {title: 'Really Big'}]
  });
  let expected = [
    {id: 1, title: 'Really Big'},
    {id: 2, title: 'Really Big'}
  ];
  assert.deepEqual(projectList, expected);
});

test("using diverse attributes", function(assert) {
  let projectList = FactoryGuy.buildRawList({
    name: 'project',
    opts: [
      'big',
      {title: 'Really Big'},
      ['with_dude', {title: 'I have a dude'}]
    ]
  });
  let expected = [
    {id: 1, title: 'Big Project'},
    {id: 2, title: 'Really Big'},
    {id: 3, title: 'I have a dude', user: {id: 1, name: 'Dude', style: "normal"}}];
  assert.deepEqual(projectList, expected);
});

moduleFor('serializer:application', 'FactoryGuy and JSONAPI', inlineSetup('-json-api'));
test('#updateHTTPMethod with JSON-API Serializer', function(assert) {
  const method = FactoryGuy.updateHTTPMethod('application');
  assert.equal(method, 'PATCH');
});

moduleFor('serializer:application', 'FactoryGuy and REST', inlineSetup('-rest'));
test('#updateHTTPMethod with REST Serializer', function(assert) {
  const method = FactoryGuy.updateHTTPMethod('application');
  assert.equal(method, 'PUT');
});
