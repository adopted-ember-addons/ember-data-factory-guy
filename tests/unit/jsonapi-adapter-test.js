import Ember from 'ember';
import FactoryGuy, { build, buildList } from 'ember-data-factory-guy';

import SharedAdapterBehavior from './shared-adapter-tests';
import { title, inlineSetup } from '../helpers/utility-methods';

let App = null;
let adapter = 'DS.JSONAPIAdapter';
let adapterType = '-json-api';

SharedAdapterBehavior.all(adapter, adapterType);

module(title(adapter, 'FactoryGuy#build get'), inlineSetup(App, adapterType));

test("returns all attributes with no key", function () {
  let user = build('user');
  deepEqual(user.get(), {id: 1, name: 'User1', style: 'normal'});
  equal(user.get().id, 1);
  equal(user.get().name, 'User1');
});

test("returns an attribute with a key", function () {
  let user = build('user');
  equal(user.get('id'), 1);
  equal(user.get('name'), 'User1');
});

module(title(adapter, 'FactoryGuy#buildList get'), inlineSetup(App, adapterType));

test("returns array of all attributes with no key", function () {
  let users = buildList('user', 2);
  deepEqual(users.get(), [{id: 1, name: 'User1',style: "normal"}, {id: 2, name: 'User2',style: "normal"}]);
});

test("returns an attribute with a key", function () {
  let users = buildList('user', 2);
  deepEqual(users.get(0), {id: 1, name: 'User1', style: "normal"});
  equal(users.get(0).id, 1);
  deepEqual(users.get(1), {id: 2, name: 'User2', style: "normal"});
  equal(users.get(1).name, 'User2');
});

let removeFunctions = function(json) {
  delete json.includeKeys;
  delete json.getInclude;
  delete json.isProxy;
  delete json.get;
};

module(title(adapter, 'FactoryGuy#build custom'), inlineSetup(App, adapterType));

test("with traits defining model attributes", function () {
  let json = build('project', 'big').data;
  deepEqual(json, {
    id: 1,
    type: 'project',
    attributes: {
      title: 'Big Project',
    }
  });
});

test("sideloads belongsTo records which are built from fixture definition", function () {
  let json = build('project', 'with_user');
  removeFunctions(json);
  deepEqual(json,
    {
      data: {
        id: 1,
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
            name: "User1",
            style: "normal"
          }
        }
      ]
    });
});

test("sideloads belongsTo record passed as ( prebuilt ) attribute", function () {
  let user = build('user');
  let json = build('project', {user: user});
  removeFunctions(json);
  deepEqual(json,
    {
      data: {
        id: 1,
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
            name: "User1",
            style: "normal"
          }
        }
      ]
    });
});


test("sideloads many belongsTo records which are built from fixture definition", function () {
  let json = build('project', 'big', 'with_user');
  removeFunctions(json);
  deepEqual(json,
    {
      data: {
        id: 1,
        type: 'project',
        attributes: {
          title: 'Big Project'
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
            name: "User1",
            style: "normal"
          }
        }
      ]
    });
});

test("with more than one trait and custom attributes", function () {
  let json = build('project', 'big', 'with_user', {title: 'Crazy Project'});
  removeFunctions(json);
  deepEqual(json,
    {
      data: {
        id: 1,
        type: 'project',
        attributes: {
          title: 'Crazy Project'
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
            name: "User1",
            style: "normal"
          }
        }
      ]
    });
});

test("with trait with custom belongsTo association object", function () {
  let json = build('project', 'big', 'with_dude');
  removeFunctions(json);
  deepEqual(json,
    {
      data: {
        id: 1,
        type: 'project',
        attributes: {
          title: 'Big Project'
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
            name: "Dude",
            style: "normal"
          }
        }
      ]
    });
});

test("using trait with attribute using FactoryGuy.belongsTo method", function () {
  let json = build('project', 'with_admin');
  removeFunctions(json);
  deepEqual(json,
    {
      data: {
        id: 1,
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
            name: "Admin",
            style: "super"
          }
        }
      ]
    });
});


test("with attribute using sequence", function () {
  let json = build('project', 'with_title_sequence');
  removeFunctions(json);

  deepEqual(json,
    {
      data: {
        id: 1,
        type: 'project',
        attributes: {
          title: 'Project1'
        }
      }
    });
});

test("sideloads hasMany records built from fixture definition", function () {
  let json = build('user', 'with_projects');
  removeFunctions(json);

  deepEqual(json,
    {
      data: {
        id: 1,
        type: 'user',
        attributes: {
          name: 'User1',
          style: "normal"
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
    });
});

test("sideloads hasMany records passed as prebuilt ( buildList ) attribute", function () {
  let projects = buildList('project', 2);
  let user = build('user', {projects: projects});
  removeFunctions(user);

  deepEqual(user,
    {
      data: {
        id: 1,
        type: 'user',
        attributes: {
          name: 'User1',
          style: "normal"
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
    });
});

test("sideloads hasMany records passed as prebuilt ( array of build ) attribute", function () {
  let project1 = build('project');
  let project2 = build('project');
  let json = build('user', {projects: [project1, project2]});
  removeFunctions(json);

  deepEqual(json,
    {
      data: {
        id: 1,
        type: 'user',
        attributes: {
          name: 'User1',
          style: "normal"
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
    });
});

test("creates default json for model", function () {
  let json = build('user');
  removeFunctions(json);

  deepEqual(json,
    {
      data: {
        id: 1,
        type: 'user',
        attributes: {
          name: 'User1',
          style: "normal"
        }
      }
    }
  );
});


test("can override default model attributes", function () {
  let json = build('user', {name: 'bob'});
  removeFunctions(json);

  deepEqual(json,
    {
      data: {
        id: 1,
        type: 'user',
        attributes: {
          name: 'bob',
          style: "normal"
        }
      }
    }
  );
});


test("can have named model definition with custom attributes", function () {
  let json = build('admin');
  removeFunctions(json);

  deepEqual(json,
    {
      data: {
        id: 1,
        type: 'user',
        attributes: {
          name: 'Admin',
          style: "super"
        }
      }
    }
  );
});


test("can override named model attributes", function () {
  let json = build('admin', {name: 'AdminGuy'});
  removeFunctions(json);

  deepEqual(json,
    {
      data: {
        id: 1,
        type: 'user',
        attributes: {
          name: 'AdminGuy',
          style: "super"
        }
      }
    }
  );
});


test("ignores transient attributes", function () {
  let json = build('property');
  removeFunctions(json);

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


test("similar model type ids are created sequentially", function () {
  let user1 = build('user');
  let user2 = build('user');
  let project = build('project');
  equal(user1.data.id, 1);
  equal(user2.data.id, 2);
  equal(project.data.id, 1);
});

test("when no custom serialize keys functions exist, dasherizes attributes and relationship keys", function () {
  let json = build('profile', 'with_bat_man');
  removeFunctions(json);

  deepEqual(json,
    {
      data: {
        id: 1,
        type: 'profile',
        attributes: {
          description: 'Text goes here',
          'camel-case-description': 'textGoesHere',
          'snake-case-description': 'text_goes_here',
          'a-boolean-field': false
        },
        relationships: {
          'super-hero': {
            data: {id: 1, type: 'super-hero'}
          }
        }
      },
      included: [
        {
          id: 1,
          type: "super-hero",
          attributes: {
            name: "BatMan",
            type: "SuperHero"
          }
        }
      ]
    });
});

test("using custom serialize keys function for transforming attributes and relationship keys", function () {
  let serializer = FactoryGuy.store.serializerFor();

  let savedKeyForAttributeFn = serializer.keyForAttribute;
  serializer.keyForAttribute = Ember.String.underscore;
  let savedKeyForRelationshipFn = serializer.keyForRelationship;
  serializer.keyForRelationship = Ember.String.underscore;

  let json = build('profile', 'with_bat_man');
  removeFunctions(json);

  deepEqual(json,
    {
      data: {
        id: 1,
        type: 'profile',
        attributes: {
          description: 'Text goes here',
          'camel_case_description': 'textGoesHere',
          'snake_case_description': 'text_goes_here',
          'a_boolean_field': false
        },
        relationships: {
          'super_hero': {
            data: {id: 1, type: 'super-hero'}
          }
        }
      },
      included: [
        {
          id: 1,
          type: "super-hero",
          attributes: {
            name: "BatMan",
            type: "SuperHero"
          }
        }
      ]
    });

  serializer.keyForAttribute = savedKeyForAttributeFn;
  serializer.keyForRelationship = savedKeyForRelationshipFn;

});

test("serializes attributes with custom type", function () {
  let info = {first: 1};
  let json = build('user', {info: info});
  removeFunctions(json);

  deepEqual(json,
    {
      data: {
        id: 1,
        type: 'user',
        attributes: {
          name: 'User1',
          style: "normal",
          info: '{"first":1}'
        }
      }
    }
  );
});

test("with (nested json fixture) belongsTo has a hasMany association which has a belongsTo", function () {

  let expectedData = {
    data: {
      type: "project",
      id: 1,
      attributes: {
        title: "Project1"
      },
      relationships: {
        user: {
          data: {id: 1, type: "user"},
        }
      }
    },
    "included": [
      {
        type: "outfit",
        id: 1,
        attributes: {
          name: "Outfit1"
        },
      }, {
        type: "big-hat",
        id: 1,
        attributes: {
          type: "BigHat"
        },
        relationships: {
          outfit: {
            data: {id: 1, type: 'outfit'}
          }
        }
      }, {
        type: "outfit",
        id: 2,
        attributes: {
          name: "Outfit2"
        },
      }, {
        type: "big-hat",
        id: 2,
        attributes: {
          type: "BigHat"
        },
        relationships: {
          outfit: {
            data: {id: 2, type: 'outfit'}
          }
        }
      }, {
        type: "user",
        id: 1,
        attributes: {
          name: "User1",
          style: "normal"
        },
        relationships: {
          hats: {
            data: [
              {type: "big-hat", id: 1},
              {type: "big-hat", id: 2}
            ]
          }
        }
      }
    ]
  };

  let projectJson = build('project', 'with_user_having_hats_belonging_to_outfit');
  deepEqual(projectJson.data, expectedData.data);
  deepEqual(projectJson.included, expectedData.included);

});
