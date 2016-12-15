import {moduleFor, test} from 'ember-qunit';
import DS from 'ember-data';
import Ember from 'ember';
import FactoryGuy, {make, makeList, build, buildList, clearStore} from 'ember-data-factory-guy';
import MissingSequenceError from 'ember-data-factory-guy/missing-sequence-error';

import {inlineSetup} from '../helpers/utility-methods';
import User from 'dummy/models/user';

const A = Ember.A;

moduleFor('serializer:application', 'FactoryGuy', inlineSetup('-json-api'));

test("has store set in initializer", function(assert) {
  assert.ok(FactoryGuy.store instanceof DS.Store);
});

test('make throws exception if there is NO store setup', function(assert) {
  FactoryGuy.store = null;
  assert.throws(
    function() {
      make('profile');
    },
    function(err) {
      return !!err.toString().match(/Use manualSetup\(this.container\) in model\/component test/);
    });
});

test('makeList throws exception if there is NO store setup', function(assert) {
  FactoryGuy.store = null;
  assert.throws(
    function() {
      makeList('profile');
    },
    function(err) {
      return !!err.toString().match(/Use manualSetup\(this.container\) in model\/component test/);
    }
  );
});

test("#make returns a model instance", function(assert) {
  let user = FactoryGuy.make('user');
  assert.ok(user instanceof User);
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

test("exposes clearStore method which is a shortcut for FactoryGuy.clearStore", function(assert) {
  Ember.run(function() {
    makeList('user', 2);
    clearStore();
    assert.equal(FactoryGuy.store.peekAll('user').get('content').length, 0);
  });
});

test("#clearStore clears the store of models, and resets the model definition", function(assert) {
  Ember.run(function() {
    let project = make('project');
    let user = make('user', { projects: [project] });
    let model, definition;

    for (model in FactoryGuy.modelDefinitions) {
      definition = FactoryGuy.modelDefinitions[model];
      sinon.spy(definition, 'reset');
    }

    FactoryGuy.clearStore();

    assert.equal(FactoryGuy.store.peekAll('user').get('content.length'), 0);
    assert.equal(FactoryGuy.store.peekAll('project').get('content.length'), 0);

    for (model in FactoryGuy.modelDefinitions) {
      definition = FactoryGuy.modelDefinitions[model];
      assert.ok(definition.reset.calledOnce);
      definition.reset.restore();
    }
  });
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

test("with one level of hasMany relationship", function(assert) {
  let hats = buildList('big-hat', 2);
  let user = build('user', { hats: hats });

  assert.ok(user['user']);
  assert.equal(user['big-hats'].length, 2);
});

test("can use non model attributes to help setup attributes", function(assert) {
  let dog1 = build('dog');
  assert.equal(dog1.get('sound'), 'Normal Woof', 'no extra attribute');

  let volume = 'Soft';
  let dog2 = build('dog', { volume });

  assert.equal(dog2.get('sound'), `${volume} Woof`, 'uses your extra attribute');
});

test("causes an assertion error when a trait is not found", function(assert) {
  try {
    build('user', 'non_existent_trait');
  } catch (error) {
    assert.equal(error.message, "Assertion Failed: You're trying to use a trait [non_existent_trait] for model user but that trait can't be found.");
  }
});

test("handles hash attribute with hash value as default value", function(assert) {
  let dog = build('dog');
  assert.deepEqual(dog.get('tag'), { num: 1 });
});

test("handles hash attribute with hash value in options", function(assert) {
  let dog = build('dog', {tag: {num: 10}});
  assert.deepEqual(dog.get('tag'), { num: 10 });
});

moduleFor('serializer:application', 'FactoryGuy#buildList', inlineSetup('-rest'));

test("without a number returns a empty json payload", function(assert) {
  let users = buildList('user');
  assert.equal(users.get().length, 0);
});

test("without a number but with options returns array with diverse attributes", function(assert) {
  let profiles = buildList('profile', 'goofy_description', ['with_company', { description: 'Noodles' }], 'with_bat_man');
  assert.equal(profiles.get().length, 3);
  assert.ok(profiles.get(0).description === 'goofy');
  assert.ok(profiles.get(1).company === 1);
  assert.ok(profiles.get(1).description === 'Noodles');
  assert.ok(profiles.get(2).superHero === 1);
});

test("with a number and extra options", function(assert) {
  let heros = buildList('super-hero', 2, { name: "Bob" });
  assert.equal(heros.get().length, 2);
  assert.equal(heros.get(0).name, "Bob");
  assert.equal(heros.get(1).name, "Bob");
});


moduleFor('serializer:application', 'FactoryGuy#makeList', inlineSetup('-json-api'));

test("with number as 0 returns an empty array of model instances", function(assert) {
  let users = makeList('user', 0);
  assert.equal(users.length, 0);
});

test("with number returns that many model instances", function(assert) {
  // important to test on model with NO traits
  let users = makeList('outfit', 2);
  assert.equal(users.length, 2);
});

test("without a number returns an array of 0 model instances", function(assert) {
  let users = makeList('user');
  assert.equal(users.length, 0);
});

test("without a number but with options returns array of models", function(assert) {
  let profiles = makeList('profile', 'goofy_description', ['with_company', { description: 'Noodles' }], 'with_bat_man');
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
      personName: (i)=> `person #${i}`
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
      personName: (i)=> `stoner #${i}`
    }
  });

  let json;

  json = FactoryGuy.build('person').data;
  assert.equal(json.attributes.name, 'person #1');

  json = FactoryGuy.build('philosopher').data;
  // since the sequence ( personName ) that was inherited from person is owned by stoner,
  // the person # starts at 1 again, and is not person #2
  assert.equal(json.attributes.name, 'person #1', 'inherits parent default attribute functions and sequences');
  assert.equal(json.attributes.style, 'thinker', 'local attributes override parent attributes');

  json = FactoryGuy.build('stoner').data;
  assert.equal(json.attributes.name, 'stoner #1', 'uses local sequence with inherited parent default attribute function');

});

test("config is not destroyed", function(assert) {
  var config = {
    default: {
      color: 'yellow'
    }
  };

  FactoryGuy.define('apple', config);
  assert.deepEqual(config, { default: { color: 'yellow' } });
});

test("using polymorphic:false to use a type attribute name on non polymorphic model", function(assert) {
  let cat = build('cat', { type: 'fluffy' });

  assert.equal(cat.data.type, 'cat');
  assert.equal(cat.get('type'), 'fluffy');
});

test("traits are inherited", function(assert) {
  FactoryGuy.define('person', {
    traits: {
      lazy_style: { style: 'Super Lazy' }
    }
  });

  FactoryGuy.define('stoner', {
    extends: 'person',
    traits: {
      real_name: { name: 'Stoned Guy' }
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

test("id can be a function", function(assert) {
  FactoryGuy.define('stoner', {

    sequences: {
      stonerId: (i)=>`stoner-${i}`,
    },

    bif: {
      id: FactoryGuy.generate('stonerId'),
      name: 'Bif'
    }
  });

  let json = FactoryGuy.build('bif').data;
  assert.equal(json.id, 'stoner-1');
});

//moduleFor('serializer:application', 'FactoryGuy#define', inlineSetup(App));

//test("Using sequences", function () {
//
//  FactoryGuy.define('person', {
//    sequences: {
//      personName: function (num) {
//        return 'person #' + num;
//      },
//      personType: function (num) {
//        return 'person type #' + num;
//      }
//    },
//    default: {
//      type: 'normal',
//      name: FactoryGuy.generate('personName')
//    },
//    dude: {
//      type: FactoryGuy.generate('personType')
//    },
//    bro: {
//      type: FactoryGuy.generate('broType')
//    },
//    dude_inline: {
//      type: FactoryGuy.generate(function (num) {
//        return 'Dude #' + num;
//      })
//    }
//  });
//
//  let json = FactoryGuy.build('person').data;
//  deepEqual(json, {
//    id: 1,
//    type: 'person',
//    attributes: {
//      name: 'person #1',
//      type: 'normal'
//    }
//  }, 'in default attributes');
//
//
//  json = FactoryGuy.build('dude').data;
//  deepEqual(json, {
//    id: 2,
//    type: 'person',
//    attributes: {
//      name: 'person #2',
//      type: 'person type #1'
//    }
//  }, 'in named attributes');
//
//
//  throws(function () {
//      FactoryGuy.build('bro');
//    },
//    MissingSequenceError,
//    "throws error when sequence name not found"
//  );
//
//  json = FactoryGuy.build('dude_inline').data;
//  deepEqual(json, {
//    id: 3,
//    type: 'person',
//    attributes: {
//      name: 'person #3',
//      type: 'Dude #1'
//    }
//  }, 'as inline sequence function #1');
//
//
//  json = FactoryGuy.build('dude_inline').data;
//  deepEqual(json, {
//    id: 4,
//    type: 'person',
//    attributes: {
//      name: 'person #4',
//      type: 'Dude #2'
//    }
//  }, 'as inline sequence function #2');
//});


//test("Referring to other attributes in attribute definition", function () {
//
//  FactoryGuy.define('person', {
//    default: {
//      name: 'Bob',
//      type: 'normal'
//    },
//    funny_person: {
//      type: function (f) {
//        return 'funny ' + f.name;
//      }
//    },
//    missing_person: {
//      type: function (f) {
//        return 'level ' + f.brain_size;
//      }
//    }
//  });
//
//  let json = FactoryGuy.build('funny_person').data;
//  deepEqual(json, {
//    id: 1,
//    type: 'person',
//    attributes: {
//      name: 'Bob',
//      type: 'funny Bob'
//    }
//  }, 'works when attribute exists');
//
//  json = FactoryGuy.build('missing_person').data;
//  deepEqual(json, {
//    id: 2,
//    type: 'person',
//    attributes: {
//      name: 'Bob',
//      type: 'level undefined'
//    }
//  }, 'still works when attribute does not exists');
//
//});


//test("Using belongsTo associations in attribute definition", function () {
//  let json = FactoryGuy.build('project_with_user');
//  let relationships = json.data.relationships;
//  let included = json.included[0];
//  deepEqual(relationships,
//    {
//      user: {
//        data: {id: 1, type: 'user'}
//      }
//    },
//    'creates relationship in parent');
//  deepEqual(included,
//    {
//      id: 1,
//      type: "user",
//      attributes: {
//        name: "User1"
//      }
//    }, 'creates default association in included hash');
//
//  json = FactoryGuy.build('project_with_dude');
//  relationships = json.data.relationships;
//  included = json.included[0];
//  deepEqual(relationships,
//    {
//      user: {
//        data: {id: 2, type: 'user'}
//      }
//    },
//    'creates relationship in parent');
//  deepEqual(included,
//    {
//      id: 2,
//      type: "user",
//      attributes: {
//        name: "Dude"
//      }
//    }, 'creates association with optional attributes in included hash');
//
//
//  json = FactoryGuy.build('project_with_admin');
//  relationships = json.data.relationships;
//  included = json.included[0];
//  deepEqual(relationships,
//    {
//      user: {
//        data: {id: 3, type: 'user'}
//      }
//    },
//    'creates relationship in parent');
//  deepEqual(included,
//    {
//      id: 3,
//      type: "user",
//      attributes: {
//        name: "Admin"
//      }
//    }, 'creates association using named attribute');
//
//
//  json = FactoryGuy.build('project_with_parent');
//  relationships = json.data.relationships;
//  included = json.included[0];
//  deepEqual(relationships,
//    {
//      parent: {
//        data: {id: 4, type: 'project'}
//      }
//    }, 'creates relationship in parent');
//  deepEqual(included,
//    {
//      id: 4,
//      type: "project",
//      attributes: {
//        title: "Project5"
//      }
//    }, 'belongsTo association name differs from model name');
//});
//
//
//test("Using hasMany associations in attribute definition", function () {
//  let json = FactoryGuy.build('user_with_projects');
//  deepEqual(json,
//    {
//      data: {
//        id: 1,
//        type: 'user',
//        attributes: {
//          name: 'User1'
//        },
//        relationships: {
//          projects: {
//            data: [
//              {id: 1, type: 'project'},
//              {id: 2, type: 'project'}
//            ]
//          }
//        }
//      },
//      included: [
//        {
//          id: 1,
//          type: "project",
//          attributes: {
//            title: "Project1"
//          }
//        },
//        {
//          id: 2,
//          type: "project",
//          attributes: {
//            title: "Project2"
//          }
//        }
//      ]
//    }
//  );
//
//});


moduleFor('serializer:application', 'FactoryGuy#buildRaw', inlineSetup('-json-api'));

test("Using sequences", function(assert) {

  FactoryGuy.define('person', {
    sequences: {
      personName: (num)=> `person #${num}`,
      personType: (num)=> `person type #${num}`
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

  let json = FactoryGuy.buildRaw('person');
  let expected = { id: 1, name: 'person #1', type: 'normal' };
  assert.deepEqual(json, expected, 'in default attributes');

  json = FactoryGuy.buildRaw('dude');
  expected = { id: 2, name: 'person #2', type: 'person type #1' };
  assert.deepEqual(json, expected, 'in named attributes');

  assert.throws(function() {
      FactoryGuy.buildRaw('bro');
    },
    MissingSequenceError,
    "throws error when sequence name not found"
  );

  json = FactoryGuy.buildRaw('dude_inline');
  expected = { id: 3, name: 'person #3', type: 'Dude #1' };
  assert.deepEqual(json, expected, 'as inline sequence function #1');


  json = FactoryGuy.buildRaw('dude_inline');
  expected = { id: 4, name: 'person #4', type: 'Dude #2' };
  assert.deepEqual(json, expected, 'as inline sequence function #2');
});


test("Referring to other attributes in attribute definition", function(assert) {

  FactoryGuy.define('person', {
    default: {
      name: 'Bob',
      type: 'normal'
    },
    funny_person: {
      type: (f)=> `funny ${f.name}`
    },
    index_name: {
      name: (f)=> `Person ${f.id}`
    },
    missing_person: {
      type: (f)=> `level ${f.brain_size}`
    }
  });

  let json = FactoryGuy.buildRaw('index_name');
  let expected = { id: 1, name: 'Person 1', type: 'normal' };
  assert.deepEqual(json, expected, 'id is available');

  json = FactoryGuy.buildRaw('funny_person');
  expected = { id: 2, name: 'Bob', type: 'funny Bob' };
  assert.deepEqual(json, expected, 'works when attribute exists');

  json = FactoryGuy.buildRaw('missing_person');
  expected = { id: 3, name: 'Bob', type: 'level undefined' };
  assert.deepEqual(json, expected, 'still works when attribute does not exists');
});


test("Using default belongsTo associations in attribute definition", function(assert) {
  let json = FactoryGuy.buildRaw('project_with_user');
  let expected = { id: 1, title: 'Project1', user: { id: 1, name: 'User1', style: "normal" } };
  assert.deepEqual(json, expected);
});

test("creates association with optional attributes", function(assert) {
  let json = FactoryGuy.buildRaw('project_with_dude');
  let expected = {
    id: 1,
    title: 'Project1',
    user: { id: 1, name: 'Dude', style: "normal" }
  };
  assert.deepEqual(json, expected);
});


test("creates association using named attribute", function(assert) {
  let json = FactoryGuy.buildRaw('project_with_admin');
  let expected = {
    id: 1,
    title: 'Project1',
    user: { id: 1, name: 'Admin', style: "super" }
  };
  assert.deepEqual(json, expected);
});


test("belongsTo association name differs from model name", function(assert) {
  let json = FactoryGuy.buildRaw('project_with_parent');
  let expected = {
    id: 1,
    title: 'Project1',
    parent: { id: 2, title: 'Project2' }
  };
  assert.deepEqual(json, expected);
});


test("Using hasMany associations in attribute definition", function(assert) {
  let json = FactoryGuy.buildRaw('user_with_projects');
  let expected = {
    id: 1,
    name: 'User1',
    style: "normal",
    projects: [{ id: 1, title: 'Project1' }, { id: 2, title: 'Project2' }]
  };
  assert.deepEqual(json, expected);
});


test("with traits defining model attributes", function(assert) {
  let json = FactoryGuy.buildRaw('project', 'big');
  let expected = { id: 1, title: 'Big Project' };
  assert.deepEqual(json, expected);
});

test("with traits defining belongsTo association", function(assert) {
  let json = FactoryGuy.buildRaw('project', 'with_user');
  let expected = {
    id: 1, title: 'Project1', user: { id: 1, name: 'User1', style: "normal" }
  };
  assert.deepEqual(json, expected);
});

test("with more than one trait used", function(assert) {
  let json = FactoryGuy.buildRaw('project', 'big', 'with_user');
  let expected = {
    id: 1, title: 'Big Project',
    user: { id: 1, name: 'User1', style: "normal" }
  };
  assert.deepEqual(json, expected);
});

test("with more than one trait and custom attributes", function(assert) {
  let json = FactoryGuy.buildRaw('project', 'big', 'with_user', { title: 'Crazy Project' });
  let expected = {
    id: 1,
    title: 'Crazy Project',
    user: { id: 1, name: 'User1', style: "normal" }
  };
  assert.deepEqual(json, expected);
});

test("with trait with custom belongsTo association object", function(assert) {
  let json = FactoryGuy.buildRaw('project', 'big', 'with_dude');
  let expected = {
    id: 1,
    title: 'Big Project',
    user: { id: 1, name: 'Dude', style: "normal" }
  };
  assert.deepEqual(json, expected);
});

test("using trait with association using FactoryGuy.belongsTo method", function(assert) {
  let json = FactoryGuy.buildRaw('project', 'with_admin');
  let expected = {
    id: 1,
    title: 'Project1',
    user: { id: 1, name: 'Admin', style: "super" }
  };
  assert.deepEqual(json, expected);
});

test("with attribute using sequence", function(assert) {
  let json = FactoryGuy.buildRaw('project', 'with_title_sequence');
  let expected = { id: 1, title: 'Project1' };
  assert.deepEqual(json, expected);
});

test("with trait defining association using FactoryGuy.hasMany method", function(assert) {
  let json = FactoryGuy.buildRaw('user', 'with_projects');
  let expected = {
    id: 1,
    name: 'User1',
    style: "normal",
    projects: [{ id: 1, title: 'Project1' }, { id: 2, title: 'Project2' }]
  };
  assert.deepEqual(json, expected);
});

test("with trait defining association using FactoryGuy.hasMany method that uses splat style attributes", function(assert) {
  let json = FactoryGuy.buildRaw('user', 'with_projects_splat');
  let expected = {
    id: 1,
    name: 'User1',
    style: "normal",
    projects: [
      { id: 1, title: 'Big Project' },
      { id: 2, title: 'Small Project' },
      { id: 3, title: 'Cool Project' }
    ]
  };
  assert.deepEqual(json, expected);
});

test("creates default json for model", function(assert) {
  let json = FactoryGuy.buildRaw('user');
  let expected = { id: 1, name: 'User1', style: "normal" };
  assert.deepEqual(json, expected);
});


test("can override default model attributes", function(assert) {
  let json = FactoryGuy.buildRaw('user', { name: 'bob' });
  let expected = { id: 1, name: 'bob', style: "normal" };
  assert.deepEqual(json, expected);
});


test("with named model definition with custom attributes", function(assert) {
  let json = FactoryGuy.buildRaw('admin');
  let expected = { id: 1, name: 'Admin', style: "super" };
  assert.deepEqual(json, expected);
});


test("overrides named model attributes", function(assert) {
  let json = FactoryGuy.buildRaw('admin', { name: 'AdminGuy' });
  let expected = { id: 1, name: 'AdminGuy', style: "super" };
  assert.deepEqual(json, expected);
});


test("ignores transient attributes", function(assert) {
  let json = FactoryGuy.buildRaw('property');
  let expected = { id: 1, name: 'Silly property' };
  assert.deepEqual(json, expected);
});

test("removes id for model fragment attribute", function(assert) {
  let json = FactoryGuy.buildRaw('manager');
  assert.deepEqual(json.name.id, undefined);
});

test("removes id for model fragmentArray attribute", function(assert) {
  let json = FactoryGuy.buildRaw('employee', 'with_department_employments');
  let ids = Ember.A(json.departmentEmployments.map((obj)=>obj.id)).compact();
  assert.deepEqual(ids, []);
});


moduleFor('serializer:application', 'FactoryGuy#buildRawList', inlineSetup('-json-api'));

test("basic", function(assert) {
  let userList = FactoryGuy.buildRawList('user', 2);
  let expected = [{ id: 1, name: 'User1', style: "normal" }, { id: 2, name: 'User2', style: "normal" }];
  assert.deepEqual(userList, expected);
});

test("using custom attributes", function(assert) {
  let userList = FactoryGuy.buildRawList('user', 2, { name: 'Crazy' });
  let expected = [{ id: 1, name: 'Crazy', style: "normal" }, { id: 2, name: 'Crazy', style: "normal" }];
  assert.deepEqual(userList, expected);
});

test("using traits", function(assert) {
  let projectList = FactoryGuy.buildRawList('project', 2, 'big');
  let expected = [{ id: 1, title: 'Big Project' }, { id: 2, title: 'Big Project' }];
  assert.deepEqual(projectList, expected);
});

test("using traits and custom attributes", function(assert) {
  let projectList = FactoryGuy.buildRawList('project', 2, 'big', { title: 'Really Big' });
  let expected = [{ id: 1, title: 'Really Big' }, { id: 2, title: 'Really Big' }];
  assert.deepEqual(projectList, expected);
});

test("using diverse attributes", function(assert) {
  let projectList = FactoryGuy.buildRawList('project', 'big', { title: 'Really Big' }, ['with_dude', { title: 'I have a dude' }]);
  let expected = [
    { id: 1, title: 'Big Project' },
    { id: 2, title: 'Really Big' },
    { id: 3, title: 'I have a dude', user: { id: 1, name: 'Dude', style: "normal" } }];
  assert.deepEqual(projectList, expected);
});

moduleFor('serializer:application', 'FactoryGuy and JSONAPI', inlineSetup('-json-api'));
test('it knows how to update with JSON-API', function(assert) {
  const method = FactoryGuy.updateHTTPMethod('application');
  assert.equal(method, 'PATCH');
});

moduleFor('serializer:application', 'FactoryGuy and REST', inlineSetup('-rest'));
test('it knows how to update with RESTSerializer', function(assert) {
  const method = FactoryGuy.updateHTTPMethod('application');
  assert.equal(method, 'PUT');
});
