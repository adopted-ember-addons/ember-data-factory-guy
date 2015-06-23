import Ember from 'ember';
import FactoryGuy, { make, makeList, build, buildList, clearStore } from 'ember-data-factory-guy';
import MissingSequenceError from 'ember-data-factory-guy/missing-sequence-error';

import { theUsualSetup, theUsualTeardown } from '../helpers/utility-methods';

import User from 'dummy/models/user';

var App;

module('FactoryGuy', {
  setup: function () {
    App = theUsualSetup('-active-model');
  },
  teardown: function () {
    theUsualTeardown(App);
  }
});

test("has store set in initializer", function () {
  ok(FactoryGuy.getStore() instanceof DS.Store);
});

test("#make returns a model instance", function () {
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
  var json = build('user').data;
  deepEqual(json, {
    id: 1,
    type: 'user',
    attributes: {
      name: 'User1'
    }
  });
});

test("exposes buildList method which is shortcut for FactoryGuy.buildList", function () {
  var userList = FactoryGuy.buildList('user', 2);
  deepEqual(userList[0], {id: 1, name: 'User1'});
  deepEqual(userList[1], {id: 2, name: 'User2'});
});

test("exposes clearStore method which is a shortcut for FactoryGuy.clearStore", function () {
  Ember.run(function () {
    makeList('user', 2);
    clearStore();
    equal(FactoryGuy.getStore().peekAll('user').get('content').length, 0);
  });
});


test("Using sequences in definitions", function () {

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

  var json = FactoryGuy.build('person').data;
  deepEqual(json, {
    id: 1,
    type: 'person',
    attributes: {
      name: 'person #1',
      type: 'normal'
    }
  }, 'in default attributes');


  json = FactoryGuy.build('dude').data;
  deepEqual(json, {
    id: 2,
    type: 'person',
    attributes: {
      name: 'person #2',
      type: 'person type #1'
    }
  }, 'in named attributes');


  throws(function () {
      FactoryGuy.build('bro');
    },
    MissingSequenceError,
    "throws error when sequence name not found"
  );

  json = FactoryGuy.build('dude_inline').data;
  deepEqual(json, {
    id: 3,
    type: 'person',
    attributes: {
      name: 'person #3',
      type: 'Dude #1'
    }
  }, 'as inline sequence function #1');


  json = FactoryGuy.build('dude_inline').data;
  deepEqual(json, {
    id: 4,
    type: 'person',
    attributes: {
      name: 'person #4',
      type: 'Dude #2'
    }
  }, 'as inline sequence function #2');
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

  var json = FactoryGuy.build('funny_person').data;
  deepEqual(json, {
    id: 1,
    type: 'person',
    attributes: {
      name: 'Bob',
      type: 'funny Bob'
    }
  }, 'works when attribute exists');

  json = FactoryGuy.build('missing_person').data;
  deepEqual(json, {
    id: 2,
    type: 'person',
    attributes: {
      name: 'Bob',
      type: 'level undefined'
    }
  }, 'still works when attribute does not exists');

});


test("Using belongsTo associations in attribute definition", function () {
  var json = FactoryGuy.build('project_with_user');
  var relationships = json.data.relationships;
  var included = json.included[0];
  deepEqual(relationships,
    {
      user: {
        data: {id: 1, type: 'user'}
      }
    },
    'creates relationship in parent');
  deepEqual(included,
    {
      id: 1,
      type: "user",
      attributes: {
        name: "User1"
      }
    }, 'creates default association in included hash');

  json = FactoryGuy.build('project_with_dude');
  relationships = json.data.relationships;
  included = json.included[0];
  deepEqual(relationships,
    {
      user: {
        data: {id: 2, type: 'user'}
      }
    },
    'creates relationship in parent');
  deepEqual(included,
    {
      id: 2,
      type: "user",
      attributes: {
        name: "Dude"
      }
    }, 'creates association with optional attributes in included hash');


  json = FactoryGuy.build('project_with_admin');
  relationships = json.data.relationships;
  included = json.included[0];
  deepEqual(relationships,
    {
      user: {
        data: {id: 3, type: 'user'}
      }
    },
    'creates relationship in parent');
  deepEqual(included,
    {
      id: 3,
      type: "user",
      attributes: {
        name: "Admin"
      }
    }, 'creates association using named attribute');


  json = FactoryGuy.build('project_with_parent');
  relationships = json.data.relationships;
  included = json.included[0];
  deepEqual(relationships,
    {
      parent: {
        data: {id: 4, type: 'project'}
      }
    }, 'creates relationship in parent');
  deepEqual(included,
    {
      id: 4,
      type: "project",
      attributes: {
        title: "Project5"
      }
    }, 'belongsTo association name differs from model name');
});


test("Using hasMany associations in attribute definition", function () {
  var json = FactoryGuy.build('user_with_projects');
  deepEqual(json,
    {
      data: {
        id: 1,
        type: 'user',
        attributes: {
          name: 'User1'
        },
        relationships: {
          projects: {
            data: [
              {id: 1, type: 'project'},
              {id: 2, type: 'project'}
            ]
          }
        }
      },
      included: [
        {
          id: 1,
          type: "project",
          attributes: {
            title: "Project1"
          }
        },
        {
          id: 2,
          type: "project",
          attributes: {
            title: "Project2"
          }
        }
      ]
    }
  );

});


test("#build with traits", function () {
  var json = FactoryGuy.build('project', 'big').data;
  deepEqual(json, {
    id: 1,
    type: 'project',
    attributes: {
      title: 'Big Project',
    }
  }, 'trait with model attributes');


  json = FactoryGuy.build('project', 'with_user');
  deepEqual(json,
    {
      data: {
        id: 2,
        type: 'project',
        attributes: {
          title: 'Project1'
        },
        relationships: {
          user: {
            data: {id: 1, type: 'user'}
          }

        }
      },
      included: [
        {
          id: 1,
          type: "user",
          attributes: {
            name: "User1"
          }
        }
      ]
    },
    'trait with belongsTo attributes'
  );


  json = FactoryGuy.build('project', 'big', 'with_user');
  deepEqual(json,
    {
      data: {
        id: 3,
        type: 'project',
        attributes: {
          title: 'Big Project'
        },
        relationships: {
          user: {
            data: {id: 2, type: 'user'}
          }

        }
      },
      included: [
        {
          id: 2,
          type: "user",
          attributes: {
            name: "User2"
          }
        }
      ]
    },
    'more than one trait used together'
  );


  json = FactoryGuy.build('project', 'big', 'with_user', {title: 'Crazy Project'});
  deepEqual(json,
    {
      data: {
        id: 4,
        type: 'project',
        attributes: {
          title: 'Crazy Project'
        },
        relationships: {
          user: {
            data: {id: 3, type: 'user'}
          }

        }
      },
      included: [
        {
          id: 3,
          type: "user",
          attributes: {
            name: "User3"
          }
        }
      ]
    },
    'more than one trait used together with custom attributes'
  );


  json = FactoryGuy.build('project', 'big', 'with_dude');
  deepEqual(json,
    {
      data: {
        id: 5,
        type: 'project',
        attributes: {
          title: 'Big Project'
        },
        relationships: {
          user: {
            data: {id: 4, type: 'user'}
          }

        }
      },
      included: [
        {
          id: 4,
          type: "user",
          attributes: {
            name: "Dude"
          }
        }
      ]
    },
    'trait with custom belongsTo association object'
  );


  json = FactoryGuy.build('project', 'with_admin');
  deepEqual(json,
    {
      data: {
        id: 6,
        type: 'project',
        attributes: {
          title: 'Project2'
        },
        relationships: {
          user: {
            data: {id: 5, type: 'user'}
          }

        }
      },
      included: [
        {
          id: 5,
          type: "user",
          attributes: {
            name: "Admin"
          }
        }
      ]
    },
    'trait with attribute using FactoryGuy.association method'
  );


  json = FactoryGuy.build('project', 'with_title_sequence');
  deepEqual(json,
    {
      data: {
        id: 7,
        type: 'project',
        attributes: {
          title: 'Project3'
        }
      }
    },
    'trait with attribute using sequence'
  );


  json = FactoryGuy.build('user', 'with_projects');
  deepEqual(json,
    {
      data: {
        id: 6,
        type: 'user',
        attributes: {
          name: 'User4'
        },
        relationships: {
          projects: {
            data: [
              {id: 8, type: 'project'},
              {id: 9, type: 'project'}
            ]
          }
        }
      },
      included: [
        {
          id: 8,
          type: "project",
          attributes: {
            title: "Project4"
          }
        },
        {
          id: 9,
          type: "project",
          attributes: {
            title: "Project5"
          }
        }
      ]
    },
    'trait with hasMany association'
  );

});

test("#build creates default json for model", function () {
  var json = FactoryGuy.build('user');
  deepEqual(json,
    {
      data: {
        id: 1,
        type: 'user',
        attributes: {
          name: 'User1'
        }
      }
    }
  );
});


test("#build can override default model attributes", function () {
  var json = FactoryGuy.build('user', {name: 'bob'});
  deepEqual(json,
    {
      data: {
        id: 1,
        type: 'user',
        attributes: {
          name: 'bob'
        }
      }
    }
  );
});


test("#build can have named model definition with custom attributes", function () {
  var json = FactoryGuy.build('admin');
  deepEqual(json,
    {
      data: {
        id: 1,
        type: 'user',
        attributes: {
          name: 'Admin'
        }
      }
    }
  );
});


test("#build can override named model attributes", function () {
  var json = FactoryGuy.build('admin', {name: 'AdminGuy'});
  deepEqual(json,
    {
      data: {
        id: 1,
        type: 'user',
        attributes: {
          name: 'AdminGuy'
        }
      }
    }
  );
});


test("#build ignores transient attributes", function () {
  var json = FactoryGuy.build('property');
  deepEqual(json,
    {
      data: {
        id: 1,
        type: 'property',
        attributes: {
          name: 'Silly property'
        }
      }
    }
  );
});


test("#build similar model type ids are created sequentially", function () {
  var user1 = FactoryGuy.build('user');
  var user2 = FactoryGuy.build('user');
  var project = FactoryGuy.build('project');
  equal(user1.data.id, 1);
  equal(user2.data.id, 2);
  equal(project.data.id, 1);
});


test("#buildList creates list of fixtures", function () {
  var userList = FactoryGuy.buildList('user', 2);
  deepEqual(userList[0], {id: 1, name: 'User1'});
  deepEqual(userList[1], {id: 2, name: 'User2'});

  userList = FactoryGuy.buildList('user', 1, {name: 'Crazy'});
  deepEqual(userList[0], {id: 3, name: 'Crazy'}, 'using custom attributes');

  var projectList = FactoryGuy.buildList('project', 1, 'big');
  deepEqual(projectList[0], {id: 1, title: 'Big Project'}, 'using traits');

  projectList = FactoryGuy.buildList('project', 1, 'big', {title: 'Really Big'});
  deepEqual(projectList[0], {id: 2, title: 'Really Big'}, 'using traits and custom attributes');
});


//test("#build (nested json)", function() {
//
//  var  data = {
//    "data": {
//      "type": "project",
//      "id": "1",
//      "attributes": {
//        "title": "JSON API paints my bikeshed!"
//      },
//      "relationships": {
//        "user": {
//          "data": { "id": "1", "type": "user" },
//        }
//      }
//    },
//    "included": [{
//      "type": "user",
//      "id": "1",
//      "attributes": {
//        "name": "Dan",
//      },
//      "relationships": {
//        "hats": {
//          data: [
//            { "type": "big-hat", "id": "1" },
//            { "type": "big-hat", "id": "2" }
//          ]}
//        }
//    }, {
//      "type": "big-hat",
//      "id": "1",
//      "attributes": {
//        "type": "BigHat"
//      },
//      "relationships": {
//        "outfit": {
//          data: { id: 1, type: 'outfit' }
//        }
//      }
//    }, {
//      "type": "small-hat",
//      "id": "2",
//      "attributes": {
//        "type": "SmallHat"
//      }
//    },{
//      "type": "outfit",
//      "id": "1",
//      "attributes": {
//        "name": "outfit"
//      }
//    }
//    ]
//  }
//
//  var project = build('project', 'with_user_having_hats_belonging_to_outfit');
//  var data = FactoryGuy.convertToJSONAPIFormat('project', project)
//  //var project = build('project', 'with_user_having_hats_belonging_to_outfit');
//  console.log(data.data)
//  console.log(data.included)
//
//});


//test("#getAttributeRelationship", function() {
//  var typeName = 'user';
//  equal(FactoryGuy.getAttributeRelationship(typeName,'company').type,'company');
//  equal(FactoryGuy.getAttributeRelationship(typeName,'hats').type,'hat');
//  equal(FactoryGuy.getAttributeRelationship(typeName,'name'),null);
//});
//

module('FactoryGuy definition extending another definition', {
  setup: function () {
    App = theUsualSetup();
    //FactoryGuy.modelDefinitions['person'];
    //FactoryGuy.modelDefinitions['super-hero'];
  },
  teardown: function () {
    theUsualTeardown(App);
  }
});

test("default values and sequences", function () {
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


test("traits", function () {
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