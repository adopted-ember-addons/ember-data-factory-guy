import Ember from 'ember';
import FactoryGuy, { make, makeList, build, buildList, clearStore } from 'ember-data-factory-guy';
import MissingSequenceError from 'ember-data-factory-guy/missing-sequence-error';

import { inlineSetup, theUsualSetup, theUsualTeardown } from '../helpers/utility-methods';
import User from 'dummy/models/user';

let App = null;

import TestHelper from 'ember-data-factory-guy/factory-guy-test-helper';

//module('FactoryGuy', inlineSetup(App, '-active-model'));
module('FactoryGuy', inlineSetup(App, '-json-api'));

test("has store set in initializer", function () {
  ok(FactoryGuy.get('store') instanceof DS.Store);
});

test("#make returns a model instance", function (assert) {
  let user = FactoryGuy.make('user');
  ok(user instanceof User);
});

test("exposes make method which is shortcut for FactoryGuy.make", function () {
  ok(make('user') instanceof User);
});

test("exposes makeList method which is shortcut for FactoryGuy.makeList", function () {
  let users = makeList('user', 2);
  equal(users.length, 2);
  ok(users[0] instanceof User);
  ok(users[1] instanceof User);
  equal(FactoryGuy.get('store').peekAll('user').get('content').length, 2);
});

test("exposes build method which is shortcut for FactoryGuy.build", function () {
  let json = build('user');
  ok(json);
});

test("exposes buildList method which is shortcut for FactoryGuy.buildList", function () {
  let userList = buildList('user', 2);
  ok(userList.data.length === 2);
});

test("exposes clearStore method which is a shortcut for FactoryGuy.clearStore", function () {
  Ember.run(function () {
    makeList('user', 2);
    clearStore();
    equal(FactoryGuy.get('store').peekAll('user').get('content').length, 0);
  });
});

test("#clearStore clears the store of models, and resets the model definition", function () {
  Ember.run(function () {
    let project = make('project');
    let user = make('user', {projects: [project]});
    let model, definition;

    for (model in FactoryGuy.modelDefinitions) {
      definition = FactoryGuy.modelDefinitions[model];
      sinon.spy(definition, 'reset');
    }

    FactoryGuy.clearStore();

    equal(FactoryGuy.get('store').peekAll('user').get('content.length'), 0);
    equal(FactoryGuy.get('store').peekAll('project').get('content.length'), 0);

    for (model in FactoryGuy.modelDefinitions) {
      definition = FactoryGuy.modelDefinitions[model];
      ok(definition.reset.calledOnce);
      definition.reset.restore();
    }
  });
});

module('FactoryGuy#buildList', inlineSetup(App,'-rest'));

test("without a number returns a empty json payload", function () {
  let users = buildList('user');
  equal(users.get().length, 0);
});

test("without a number but with options returns array with diverse attributes", function () {
  let profiles = buildList('profile', 'goofy_description', ['with_company', {description: 'Noodles'}], 'with_bat_man');
  equal(profiles.get().length, 3);
  ok(profiles.get(0).description === 'goofy');
  ok(profiles.get(1).company === 1);
  ok(profiles.get(1).description === 'Noodles');
  ok(profiles.get(2).superHero === 1);
});

test("with a number and extra options", function () {
  let heros = buildList('super-hero', 2, {name: "Bob"});
  equal(heros.get().length, 2);
  equal(heros.get(0).name, "Bob");
  equal(heros.get(1).name, "Bob");
});


module('FactoryGuy#makeList', inlineSetup(App,'-json-api'));

test("with number as 0 returns an empty array of model instances", function () {
  let users = makeList('user', 0);
  equal(users.length, 0);
});

test("with number returns that many model instances", function () {
  // important to test on model with NO traits
  let users = makeList('outfit', 2);
  equal(users.length, 2);
});

test("without a number returns an array of 0 model instances", function () {
  let users = makeList('user');
  equal(users.length, 0);
});

test("without a number but with options returns array of models", function () {
  let profiles = makeList('profile', 'goofy_description', ['with_company', {description: 'Noodles'}], 'with_bat_man');
  equal(profiles.length, 3);
  ok(profiles.objectAt(0).get('description') === 'goofy');
  ok(profiles.objectAt(1).get('company.name') === 'Silly corp');
  ok(profiles.objectAt(1).get('description') === 'Noodles');
  ok(profiles.objectAt(2).get('superHero.name') === 'BatMan');
  equal(FactoryGuy.get('store').peekAll('profile').get('content').length, 3);
});


//test("when composing associations enforces has many model type", function () {
//  let profile = build('profile');
//  let user = build('user', {company: profile});
//  console.log(user.get());
//});


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

  FactoryGuy.define('philosopher', {
    extends: 'person',
    default: {
      type: 'Super Thinker'
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

  let json;

  json = FactoryGuy.build('person').data;
  equal(json.attributes.name, 'person #1');

  json = FactoryGuy.build('philosopher').data;
  // since the sequence ( personName ) that was inherited from person is owned by super hero,
  // the person# starts at 1 again, and is not person#2
  equal(json.attributes.name, 'person #1', 'inherits parent default attribute functions and sequences');
  equal(json.attributes.type, 'Super Thinker', 'local attributes override parent attributes');

  json = FactoryGuy.build('villain').data;
  equal(json.attributes.name, 'joker#1', 'uses local sequence with inherited parent default attribute function');

});


test("traits are inherited", function () {
  FactoryGuy.define('person', {
    traits: {
      lazy_type: {type: 'Super Lazy'}
    }
  });

  FactoryGuy.define('villain', {
    extends: 'person',
    traits: {
      super_name: {name: 'Joker'}
    },
    default: {
      type: 'Super Interesting'
    }
  });

  let json;

  json = FactoryGuy.build('villain', 'super_name', 'lazy_type').data;
  equal(json.attributes.type, 'Super Lazy', 'inherits parent traits');
  equal(json.attributes.name, 'Joker', 'local traits are available');
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

  FactoryGuy.define('villain', {
    extends: 'person',
    default: {
      type: 'Super Evil'
    },
    joker: {
      name: 'Joker'
    },
  });

  let json;

  json = FactoryGuy.build('joker').data;
  equal(json.attributes.name, 'Joker');

  let definition = FactoryGuy.findModelDefinition('villain');
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



module('FactoryGuy#buildRaw', inlineSetup(App,'-json-api'));

test("Using sequences", function () {

  FactoryGuy.define('person', {
    sequences: {
      personName: function (num) {
        return 'person #' + num;
      },
      personType: function (num) {
        return 'person type #' + num;
      }
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
      type: FactoryGuy.generate(function (num) {
        return 'Dude #' + num;
      })
    }
  });

  let json = FactoryGuy.buildRaw('person');
  let expected = {id: 1, name: 'person #1', type: 'normal'};
  deepEqual(json, expected, 'in default attributes');

  json = FactoryGuy.buildRaw('dude');
  expected = {id: 2, name: 'person #2', type: 'person type #1'};
  deepEqual(json, expected, 'in named attributes');

  throws(function () {
      FactoryGuy.buildRaw('bro');
    },
    MissingSequenceError,
    "throws error when sequence name not found"
  );

  json = FactoryGuy.buildRaw('dude_inline');
  expected = {id: 3, name: 'person #3', type: 'Dude #1'};
  deepEqual(json, expected, 'as inline sequence function #1');


  json = FactoryGuy.buildRaw('dude_inline');
  expected = {id: 4, name: 'person #4', type: 'Dude #2'};
  deepEqual(json, expected, 'as inline sequence function #2');
});


test("Referring to other attributes in attribute definition", function () {

  FactoryGuy.define('person', {
    default: {
      name: 'Bob',
      type: 'normal'
    },
    funny_person: {
      type: function (f) {
        return 'funny ' + f.name;
      }
    },
    missing_person: {
      type: function (f) {
        return 'level ' + f.brain_size;
      }
    }
  });

  let json = FactoryGuy.buildRaw('funny_person');
  let expected = {id: 1, name: 'Bob', type: 'funny Bob'};
  deepEqual(json, expected, 'works when attribute exists');

  json = FactoryGuy.buildRaw('missing_person');
  expected = {id: 2, name: 'Bob', type: 'level undefined'};
  deepEqual(json, expected, 'still works when attribute does not exists');
});


test("Using default belongsTo associations in attribute definition", function () {
  let json = FactoryGuy.buildRaw('project_with_user');
  let expected = {id: 1, title: 'Project1', user: {id: 1, name: 'User1', style: "normal"}};
  deepEqual(json, expected);
});

test("creates association with optional attributes", function () {
  let json = FactoryGuy.buildRaw('project_with_dude');
  let expected = {
    id: 1,
    title: 'Project1',
    user: {id: 1, name: 'Dude', style: "normal"}
  };
  deepEqual(json, expected);
});


test("creates association using named attribute", function () {
  let json = FactoryGuy.buildRaw('project_with_admin');
  let expected = {
    id: 1,
    title: 'Project1',
    user: {id: 1, name: 'Admin', style: "super"}
  };
  deepEqual(json, expected);
});


test("belongsTo association name differs from model name", function () {
  let json = FactoryGuy.buildRaw('project_with_parent');
  let expected = {
    id: 2,
    title: 'Project1',
    parent: {id: 1, title: 'Project2'}
  };
  deepEqual(json, expected);
});


test("Using hasMany associations in attribute definition", function () {
  let json = FactoryGuy.buildRaw('user_with_projects');
  let expected = {
    id: 1,
    name: 'User1',
    style: "normal",
    projects: [{id: 1, title: 'Project1'}, {id: 2, title: 'Project2'}]
  };
  deepEqual(json, expected);
});


test("with traits defining model attributes", function () {
  let json = FactoryGuy.buildRaw('project', 'big');
  let expected = {id: 1, title: 'Big Project'};
  deepEqual(json, expected);
});

test("with traits defining belongsTo association", function () {
  let json = FactoryGuy.buildRaw('project', 'with_user');
  let expected = {
    id: 1, title: 'Project1', user: {id: 1, name: 'User1', style: "normal"}
  };
  deepEqual(json, expected);
});

test("with more than one trait used", function () {
  let json = FactoryGuy.buildRaw('project', 'big', 'with_user');
  let expected = {
    id: 1, title: 'Big Project',
    user: {id: 1, name: 'User1', style: "normal"}
  };
  deepEqual(json, expected);
});

test("with more than one trait and custom attributes", function () {
  let json = FactoryGuy.buildRaw('project', 'big', 'with_user', {title: 'Crazy Project'});
  let expected = {
    id: 1,
    title: 'Crazy Project',
    user: {id: 1, name: 'User1', style: "normal"}
  };
  deepEqual(json, expected);
});

test("with trait with custom belongsTo association object", function () {
  let json = FactoryGuy.buildRaw('project', 'big', 'with_dude');
  let expected = {
    id: 1,
    title: 'Big Project',
    user: {id: 1, name: 'Dude', style: "normal"}
  };
  deepEqual(json, expected);
});

test("using trait with attribute using FactoryGuy.belongsTo method", function () {
  let json = FactoryGuy.buildRaw('project', 'with_admin');
  let expected = {
    id: 1,
    title: 'Project1',
    user: {id: 1, name: 'Admin', style: "super"}
  };
  deepEqual(json, expected);
});

test("with attribute using sequence", function () {
  let json = FactoryGuy.buildRaw('project', 'with_title_sequence');
  let expected = {id: 1, title: 'Project1'};
  deepEqual(json, expected);
});

test("with trait defining hasMany association", function () {
  let json = FactoryGuy.buildRaw('user', 'with_projects');
  let expected = {
    id: 1,
    name: 'User1',
    style: "normal",
    projects: [{id: 1, title: 'Project1'}, {id: 2, title: 'Project2'}]
  };
  deepEqual(json, expected);
});

test("creates default json for model", function () {
  let json = FactoryGuy.buildRaw('user');
  let expected = {id: 1, name: 'User1',style: "normal"};
  deepEqual(json, expected);
});


test("can override default model attributes", function () {
  let json = FactoryGuy.buildRaw('user', {name: 'bob'});
  let expected = {id: 1, name: 'bob',style: "normal"};
  deepEqual(json, expected);
});


test("with named model definition with custom attributes", function () {
  let json = FactoryGuy.buildRaw('admin');
  let expected = {id: 1, name: 'Admin',style: "super"};
  deepEqual(json, expected);
});


test("overrides named model attributes", function () {
  let json = FactoryGuy.buildRaw('admin', {name: 'AdminGuy'});
  let expected = {id: 1, name: 'AdminGuy',style: "super"};
  deepEqual(json, expected);
});


test("ignores transient attributes", function () {
  let json = FactoryGuy.buildRaw('property');
  let expected = {id: 1, name: 'Silly property'};
  deepEqual(json, expected);
});


module('FactoryGuy#buildRawList', inlineSetup(App,'-json-api'));

test("basic", function () {
  let userList = FactoryGuy.buildRawList('user', 2);
  let expected = [{id: 1, name: 'User1',style: "normal"}, {id: 2, name: 'User2',style: "normal"}];
  deepEqual(userList, expected);
});

test("using custom attributes", function () {
  let userList = FactoryGuy.buildRawList('user', 2, {name: 'Crazy'});
  let expected = [{id: 1, name: 'Crazy',style: "normal"}, {id: 2, name: 'Crazy',style: "normal"}];
  deepEqual(userList, expected);
});

test("using traits", function () {
  let projectList = FactoryGuy.buildRawList('project', 2, 'big');
  let expected = [{id: 1, title: 'Big Project'}, {id: 2, title: 'Big Project'}];
  deepEqual(projectList, expected);
});

test("using traits and custom attributes", function () {
  let projectList = FactoryGuy.buildRawList('project', 2, 'big', {title: 'Really Big'});
  let expected = [{id: 1, title: 'Really Big'}, {id: 2, title: 'Really Big'}];
  deepEqual(projectList, expected);
});

test("using diverse attributes", function() {
  let projectList = FactoryGuy.buildRawList('project', 'big', {title: 'Really Big'}, ['with_dude', {title: 'I have a dude'}]);
  let expected = [
    {id: 1, title: 'Big Project'},
    {id: 2, title: 'Really Big'},
    {id: 3, title: 'I have a dude', user: {id: 1, name: 'Dude', style: "normal"}}];
  deepEqual(projectList, expected);
});

module('FactoryGuy and JSONAPI', inlineSetup(App, '-json-api'));
test('it knows how to update with JSON-API', function (assert) {
  const method = FactoryGuy.get('updateHTTPMethod');
  assert.equal(method, 'PATCH');
});

module('FactoryGuy and REST', inlineSetup(App, '-rest'));
test('it knows how to update with RESTSerializer', function (assert) {
  const method = FactoryGuy.get('updateHTTPMethod');
  assert.equal(method, 'PUT');
});
