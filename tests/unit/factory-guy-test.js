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

  var json;

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

  var json;

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

  var json;

  json = FactoryGuy.build('joker').data;
  equal(json.attributes.name, 'Joker');

  var definition = FactoryGuy.findModelDefinition('villain');
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

  var json = FactoryGuy.buildRaw('person');
  var expected = {id: 1, name: 'person #1', type: 'normal'};
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

  var json = FactoryGuy.buildRaw('funny_person');
  var expected = {id: 1, name: 'Bob', type: 'funny Bob'};
  deepEqual(json, expected, 'works when attribute exists');

  json = FactoryGuy.buildRaw('missing_person');
  expected = {id: 2, name: 'Bob', type: 'level undefined'};
  deepEqual(json, expected, 'still works when attribute does not exists');
});


test("Using default belongsTo associations in attribute definition", function () {
  var json = FactoryGuy.buildRaw('project_with_user');
  var expected = {id: 1, title: 'Project1', user: {id: 1, name: 'User1'}};
  deepEqual(json, expected);
});

test("creates association with optional attributes", function () {
  var json = FactoryGuy.buildRaw('project_with_dude');
  var expected = {
    id: 1,
    title: 'Project1',
    user: {id: 1, name: 'Dude'}
  };
  deepEqual(json, expected);
});


test("creates association using named attribute", function () {
  var json = FactoryGuy.buildRaw('project_with_admin');
  var expected = {
    id: 1,
    title: 'Project1',
    user: {id: 1, name: 'Admin'}
  };
  deepEqual(json, expected);
});


test("belongsTo association name differs from model name", function () {
  var json = FactoryGuy.buildRaw('project_with_parent');
  var expected = {
    id: 2,
    title: 'Project1',
    parent: {id: 1, title: 'Project2'}
  };
  deepEqual(json, expected);
});


test("Using hasMany associations in attribute definition", function () {
  var json = FactoryGuy.buildRaw('user_with_projects');
  var expected = {
    id: 1,
    name: 'User1',
    projects: [{id: 1, title: 'Project1'}, {id: 2, title: 'Project2'}]
  };
  deepEqual(json, expected);
});


test("with traits defining model attributes", function () {
  var json = FactoryGuy.buildRaw('project', 'big');
  var expected = {id: 1, title: 'Big Project'};
  deepEqual(json, expected);
});

test("with traits defining belongsTo association", function () {
  var json = FactoryGuy.buildRaw('project', 'with_user');
  var expected = {
    id: 1, title: 'Project1', user: {id: 1, name: 'User1'}
  };
  deepEqual(json, expected);
});

test("with more than one trait used", function () {
  var json = FactoryGuy.buildRaw('project', 'big', 'with_user');
  var expected = {
    id: 1, title: 'Big Project',
    user: {id: 1, name: 'User1'}
  };
  deepEqual(json, expected);
});

test("with more than one trait and custom attributes", function () {
  var json = FactoryGuy.buildRaw('project', 'big', 'with_user', {title: 'Crazy Project'});
  var expected = {
    id: 1,
    title: 'Crazy Project',
    user: {id: 1, name: 'User1'}
  };
  deepEqual(json, expected);
});

test("with trait with custom belongsTo association object", function () {
  var json = FactoryGuy.buildRaw('project', 'big', 'with_dude');
  var expected = {
    id: 1,
    title: 'Big Project',
    user: {id: 1, name: 'Dude'}
  };
  deepEqual(json, expected);
});

test("using trait with attribute using FactoryGuy.belongsTo method", function () {
  var json = FactoryGuy.buildRaw('project', 'with_admin');
  var expected = {
    id: 1,
    title: 'Project1',
    user: {id: 1, name: 'Admin'}
  };
  deepEqual(json, expected);
});

test("with attribute using sequence", function () {
  var json = FactoryGuy.buildRaw('project', 'with_title_sequence');
  var expected = {id: 1, title: 'Project1'};
  deepEqual(json, expected);
});

test("with trait defining hasMany association", function () {
  var json = FactoryGuy.buildRaw('user', 'with_projects');
  var expected = {
    id: 1,
    name: 'User1',
    projects: [{id: 1, title: 'Project1'}, {id: 2, title: 'Project2'}]
  };
  deepEqual(json, expected);
});

test("creates default json for model", function () {
  var json = FactoryGuy.buildRaw('user');
  var expected = {id: 1, name: 'User1'};
  deepEqual(json, expected);
});


test("can override default model attributes", function () {
  var json = FactoryGuy.buildRaw('user', {name: 'bob'});
  var expected = {id: 1, name: 'bob'};
  deepEqual(json, expected);
});


test("with named model definition with custom attributes", function () {
  var json = FactoryGuy.buildRaw('admin');
  var expected = {id: 1, name: 'Admin'};
  deepEqual(json, expected);
});


test("overrides named model attributes", function () {
  var json = FactoryGuy.buildRaw('admin', {name: 'AdminGuy'});
  var expected = {id: 1, name: 'AdminGuy'};
  deepEqual(json, expected);
});


test("ignores transient attributes", function () {
  var json = FactoryGuy.buildRaw('property');
  var expected = {id: 1, name: 'Silly property'};
  deepEqual(json, expected);
});


module('FactoryGuy#buildRawList', inlineSetup(App,'-json-api'));

test("basic", function () {
  var userList = FactoryGuy.buildRawList('user', 2);
  var expected = [{id: 1, name: 'User1'}, {id: 2, name: 'User2'}];
  deepEqual(userList, expected);
});

test("using custom attributes", function () {
  var userList = FactoryGuy.buildRawList('user', 2, {name: 'Crazy'});
  var expected = [{id: 1, name: 'Crazy'}, {id: 2, name: 'Crazy'}];
  deepEqual(userList, expected);
});

test("using traits", function () {
  var projectList = FactoryGuy.buildRawList('project', 2, 'big');
  var expected = [{id: 1, title: 'Big Project'}, {id: 2, title: 'Big Project'}];
  deepEqual(projectList, expected);
});

test("using traits and custom attributes", function () {
  var projectList = FactoryGuy.buildRawList('project', 2, 'big', {title: 'Really Big'});
  var expected = [{id: 1, title: 'Really Big'}, {id: 2, title: 'Really Big'}];
  deepEqual(projectList, expected);
});

