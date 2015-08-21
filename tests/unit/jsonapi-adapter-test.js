import Ember from 'ember';
import FactoryGuy, { build } from 'ember-data-factory-guy';

import SharedAdapterBehavior from './shared-adapter-tests';
import { title, inlineSetup } from '../helpers/utility-methods';

var App = null;
var adapter = 'DS.JSONAPIAdapter';
var adapterType = '-json-api';

SharedAdapterBehavior.all(adapter, adapterType);

module(title(adapter, 'FactoryGuy#buildJSONAPI'), inlineSetup(App, adapterType));

test("with traits defining model attributes", function () {
  var json = build('project', 'big').data;
  deepEqual(json, {
    id: 1,
    type: 'project',
    attributes: {
      title: 'Big Project',
    }
  });
});

test("with traits defining belongsTo association", function () {
  var json = build('project', 'with_user');
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
            name: "User1"
          }
        }
      ]
    });
});

test("with more than one trait used", function () {
  var json = build('project', 'big', 'with_user');
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
            name: "User1"
          }
        }
      ]
    });
});

test("with more than one trait and custom attributes", function () {
  var json = build('project', 'big', 'with_user', {title: 'Crazy Project'});
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
            name: "User1"
          }
        }
      ]
    });
});

test("with trait with custom belongsTo association object", function () {
  var json = build('project', 'big', 'with_dude');
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
            name: "Dude"
          }
        }
      ]
    });
});

test("using trait with attribute using FactoryGuy.belongsTo method", function () {
  var json = build('project', 'with_admin');
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
            name: "Admin"
          }
        }
      ]
    });
});


test("with attribute using sequence", function () {
  var json = build('project', 'with_title_sequence');
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

test("with trait defining hasMany association", function () {
  var json = build('user', 'with_projects');
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
    });
});

test("creates default json for model", function () {
  var json = build('user');
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


test("can override default model attributes", function () {
  var json = build('user', {name: 'bob'});
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


test("can have named model definition with custom attributes", function () {
  var json = build('admin');
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


test("can override named model attributes", function () {
  var json = build('admin', {name: 'AdminGuy'});
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


test("ignores transient attributes", function () {
  var json = build('property');
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
  var user1 = build('user');
  var user2 = build('user');
  var project = build('project');
  equal(user1.data.id, 1);
  equal(user2.data.id, 2);
  equal(project.data.id, 1);
});

test("when no custom serialize keys functions exist, dasherizes attributes and relationship keys", function () {
  var json = build('profile', 'with_bat_man');
  deepEqual(json,
    {
      data: {
        id: 1,
        type: 'profile',
        attributes: {
          description: 'Text goes here',
          'camel-case-description': 'textGoesHere',
          'snake-case-description': 'text_goes_here'
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
  var serializer = FactoryGuy.getStore().serializerFor();
  serializer.keyForAttribute = Ember.String.underscore;
  serializer.keyForRelationship = Ember.String.underscore;

  var json = build('profile', 'with_bat_man');
  deepEqual(json,
    {
      data: {
        id: 1,
        type: 'profile',
        attributes: {
          description: 'Text goes here',
          'camel_case_description': 'textGoesHere',
          'snake_case_description': 'text_goes_here'
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
});

test("with (nested json fixture) belongsTo has a hasMany association which has a belongsTo", function () {

  var expectedData = {
    "data": {
      "type": "project",
      "id": 1,
      "attributes": {
        "title": "Project1"
      },
      "relationships": {
        "user": {
          "data": {"id": 1, "type": "user"},
        }
      }
    },
    "included": [
      {
        "type": "outfit",
        "id": 1,
        "attributes": {
          "name": "Outfit1"
        },
      }, {
        "type": "big-hat",
        "id": 1,
        "attributes": {
          "type": "BigHat"
        },
        "relationships": {
          "outfit": {
            data: {id: 1, type: 'outfit'}
          }
        }
      }, {
        "type": "outfit",
        "id": 2,
        "attributes": {
          "name": "Outfit2"
        },
      }, {
        "type": "big-hat",
        "id": 2,
        "attributes": {
          "type": "BigHat"
        },
        "relationships": {
          "outfit": {
            data: {id: 2, type: 'outfit'}
          }
        }
      }, {
        "type": "user",
        "id": 1,
        "attributes": {
          "name": "User1",
        },
        "relationships": {
          "hats": {
            data: [
              {"type": "big-hat", "id": 1},
              {"type": "big-hat", "id": 2}
            ]
          }
        }
      }
    ]
  };

  var projectJson = build('project', 'with_user_having_hats_belonging_to_outfit');
  deepEqual(projectJson.data, expectedData.data);
  deepEqual(projectJson.included, expectedData.included);
});


