import Ember from 'ember';
import FactoryGuy, { make, makeList, build, buildList, clearStore } from 'ember-data-factory-guy';
import MissingSequenceError from 'ember-data-factory-guy/missing-sequence-error';

import { inlineSetup, theUsualSetup, theUsualTeardown } from '../helpers/utility-methods';
import User from 'dummy/models/user';

var App = null;

import TestHelper from 'ember-data-factory-guy/factory-guy-test-helper';

//module('FactoryGuy', inlineSetup(App, '-active-model'));
module('FactoryGuy', inlineSetup(App, '-json-api'));

test("has store set in initializer", function () {
  ok(FactoryGuy.getStore() instanceof DS.Store);
});

test("#make returns a model instance", function (assert) {
  var user = FactoryGuy.make('user');
  ok(user instanceof User);
});

//test("#make returns a model instance", function (assert) {
  //Ember.run(function () {
  //  var store = FactoryGuy.getStore();
  //  var adapter = store.serializerFor('application');
  //  var modelClass = store.modelFor('profile');
  //  //var data = adapter.normalizeResponse(store, modelClass, {profile: {id:1, description:'adude', camelCaseDescription:'aDude', snake_case_description:'a_dude'}}, 1, 'findRecord');
  //  var data = adapter.normalizeResponse(store, modelClass, {
  //    profile: {
  //      id: 1,
  //      description: 'adude',
  //      camel_case_description: 'aDude',
  //      snake_case_description: 'a_dude',
  //      company: {
  //        id: 1, name: 'B'
  //      }
  //    }
  //  }, 1, 'findRecord');
  //  //console.log(adapter+'')
  //  console.log(data.data)
  //  console.log(data.data.attributes)
  //  //var pro = FactoryGuy.make('profile');
  //  var model = store.push(data);
  //  console.log(model._internalModel._data)
  //  ok(true);
  //});
  //var model = FactoryGuy.make('profile');
  //console.log(model._internalModel._data);
  //  ok(true);
  //Ember.run(function () {
  //  var done = assert.async();
  //
  //  TestHelper.handleFindAll('profile', 1);
  //
  //  FactoryGuy.getStore().findAll('profile').then(function (profiles) {
  //    console.log(profiles.get('firstObject')._internalModel._data)
  //    ok(profiles.get('firstObject.camelCaseDescription') === 'textGoesHere');
  //    ok(profiles.get('firstObject.snake_case_description') === 'text_goes_here');
  //    done();
  //  });
  //});
  //
  ////Ember.run(function () {
  //  var done = assert.async();
  //  var customDescription = "special description";
  //
  //  TestHelper.handleCreate('profile');
  //
  //  FactoryGuy.getStore().createRecord('profile', {
  //    camelCaseDescription: 'description'
  //  }).save().then(function (profile) {
  //    console.log(profile._internalModel._data)
  //    ok(profile.get('camelCaseDescription') === customDescription);
  //    done();
  //  });
  //});

//});

test("exposes make method which is shortcut for FactoryGuy.make", function () {
  ok(make('user') instanceof User);
});

test("#makeList returns an array of model instances", function () {
  var users = FactoryGuy.makeList('user', 2);
  equal(users.length, 2);
  ok(users[0] instanceof User);
  ok(users[1] instanceof User);
  equal(FactoryGuy.getStore().peekAll('user').get('content').length, 2);
});

test("exposes makeList method which is shortcut for FactoryGuy.makeList", function () {
  var users = makeList('user', 2);
  equal(users.length, 2);
  ok(users[0] instanceof User);
  ok(users[1] instanceof User);
  equal(FactoryGuy.getStore().peekAll('user').get('content').length, 2);
});

test("exposes build method which is shortcut for FactoryGuy.build", function () {
  var json = build('user');
  ok(json);
});

test("exposes buildList method which is shortcut for FactoryGuy.buildList", function () {
  var userList = FactoryGuy.buildList('user', 2);
  ok(userList.data.length === 2);
});

test("exposes clearStore method which is a shortcut for FactoryGuy.clearStore", function () {
  Ember.run(function () {
    makeList('user', 2);
    clearStore();
    equal(FactoryGuy.getStore().peekAll('user').get('content').length, 0);
  });
});


test("#clearStore clears the store of models, and resets the model definition", function () {
  Ember.run(function () {
    var project = make('project');
    var user = make('user', {projects: [project]});
    var model, definition;

    for (model in FactoryGuy.modelDefinitions) {
      definition = FactoryGuy.modelDefinitions[model];
      sinon.spy(definition, 'reset');
    }

    FactoryGuy.clearStore();

    equal(FactoryGuy.getStore().peekAll('user').get('content.length'), 0);
    equal(FactoryGuy.getStore().peekAll('project').get('content.length'), 0);

    for (model in FactoryGuy.modelDefinitions) {
      definition = FactoryGuy.modelDefinitions[model];
      ok(definition.reset.calledOnce);
      definition.reset.restore();
    }
  });
});


module('FactoryGuy#define extending another definition', inlineSetup(App,'-json-api'));

test("default values and sequences are inherited", function () {
  FactoryGuy.define('person', {
    sequences: {
      personName: function (num) {
        return 'person #' + num;
      },
    },
    default: {
      type: 'normal',
      name: FactoryGuy.generate('personName')
    }
  });

  FactoryGuy.define('super-hero', {
    extends: 'person',
    default: {
      type: 'super duper'
    }
  });

  FactoryGuy.define('villain', {
    extends: 'person',
    sequences: {
      personName: function (num) {
        return 'joker#' + num;
      }
    }
  });

  var json;

  json = FactoryGuy.build('person').data;
  equal(json.attributes.name, 'person #1');

  json = FactoryGuy.build('super-hero').data;
  // since the sequence ( personName ) that was inherited from person is owned by super hero,
  // the person# starts at 1 again, and is not person#2
  equal(json.attributes.name, 'person #1', 'inherits parent default attribute functions and sequences');
  equal(json.attributes.type, 'super duper', 'local attributes override parent attributes');

  json = FactoryGuy.build('villain').data;
  equal(json.attributes.name, 'joker#1', 'uses local sequence with inherited parent default attribute function');

});


test("traits are inherited", function () {
  FactoryGuy.define('person', {
    traits: {
      lazy_type: {type: 'Super Lazy'}
    }
  });

  FactoryGuy.define('super-hero', {
    extends: 'person',
    traits: {
      super_name: {name: 'Super Man'}
    },
    default: {
      type: 'Super Duper'
    }
  });

  var json;

  json = FactoryGuy.build('super-hero', 'super_name', 'lazy_type').data;
  equal(json.attributes.type, 'Super Lazy', 'inherits parent traits');
  equal(json.attributes.name, 'Super Man', 'local traits are available');
});


test("named types are not inherited", function () {
  FactoryGuy.define('person', {
    sequences: {
      personType: function (num) {
        return 'person type #' + num;
      }
    },
    default: {
      type: 'normal',
    },
    dude: {
      type: FactoryGuy.generate('personType')
    }
  });

  FactoryGuy.define('super-hero', {
    extends: 'person',
    default: {
      type: 'Super Duper'
    },
    super_man: {
      name: 'Super Man'
    },
  });

  var json;

  json = FactoryGuy.build('super_man').data;
  equal(json.attributes.name, 'Super Man');

  var definition = FactoryGuy.findModelDefinition('super-hero');
  equal(definition.matchesName('dude'), undefined);
});

//module('FactoryGuy#define', inlineSetup(App));

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
//  var json = FactoryGuy.build('person').data;
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
//  var json = FactoryGuy.build('funny_person').data;
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
//  var json = FactoryGuy.build('project_with_user');
//  var relationships = json.data.relationships;
//  var included = json.included[0];
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
//  var json = FactoryGuy.build('user_with_projects');
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


