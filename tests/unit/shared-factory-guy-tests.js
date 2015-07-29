import Ember from 'ember';
import FactoryGuy, { make, makeList, build, buildList } from 'ember-data-factory-guy';
import MissingSequenceError from 'ember-data-factory-guy/missing-sequence-error';
import JSONAPIConverter from 'ember-data-factory-guy/jsonapi-converter';

import User from 'dummy/models/user';
import BigHat from 'dummy/models/big-hat';
import SmallHat from 'dummy/models/small-hat';
import Outfit from 'dummy/models/outfit';

var SharedBehavior = {};

var actual = function(modelName, json) {

  if (FactoryGuy.useJSONAPI()) {
    return new JSONAPIConverter(FactoryGuy.getStore()).convert(modelName, json);
    //return FactoryGuy.convertToJSONAPIFormat(modelName, json);
  } else {
    return json;
  }
};

SharedBehavior.makeTests = function () {

  test("creates records in the store", function () {
    var user = make('user');
    ok(user instanceof User);

    var storeUser = FactoryGuy.getStore().peekRecord('user', user.id);
    ok(storeUser === user);
  });


  test("handles custom attribute type attributes", function () {
    var info = {first: 1};
    var user = make('user', {info: info});
    ok(user.get('info') === info);
  });

  test("handles camelCase attributes", function () {
    var profile = make('profile', {camelCaseDescription: 'description'});
    ok(profile.get('camelCaseDescription') === 'description');
  });

  test("with fixture options", function () {
    var profile = make('profile', {description: 'dude'});
    ok(profile.get('description') === 'dude');
  });

  test("with attributes in traits", function () {
    var profile = make('profile', 'goofy_description');
    ok(profile.get('description') === 'goofy');
  });

  test("with attributes in traits and fixture options ", function () {
    var profile = make('profile', 'goofy_description', {description: 'dude'});
    ok(profile.get('description') === 'dude');
  });


  test("when hasMany associations assigned, belongTo parent is assigned", function () {
    var project = make('project');
    var user = make('user', {projects: [project]});

    ok(project.get('user') === user);
  });


  test("when hasMany ( asnyc ) associations assigned, belongTo parent is assigned", function (assert) {
    Ember.run(function () {
      var done = assert.async();

      var user = make('user');
      var company = make('company', {users: [user]});

      user.get('company').then(function (c) {
        ok(c === company);
        done();
      });
    });
  });


  test("when hasMany ( polymorphic ) associations are assigned, belongTo parent is assigned", function () {
    var bh = make('big-hat');
    var sh = make('small-hat');
    var user = make('user', {hats: [bh, sh]});

    equal(user.get('hats.length'), 2);
    ok(user.get('hats.firstObject') instanceof BigHat);
    ok(user.get('hats.lastObject') instanceof SmallHat);
    // sets the belongTo user association
    ok(bh.get('user') === user);
    ok(sh.get('user') === user);
  });


  test("when hasMany ( self referential ) associations are assigned, belongsTo parent is assigned", function () {
    var big_group = make('big-group');
    var group = make('group', {versions: [big_group]});
    ok(big_group.get('group') === group);
  });


  test("when hasMany associations are assigned, belongsTo parent is assigned using inverse", function () {
    var project = make('project');
    var project2 = make('project', {children: [project]});

    ok(project.get('parent') === project2);
  });


  test("when hasMany associations are assigned, belongsTo parent is assigned using actual belongsTo name", function () {
    var silk = make('silk');
    var bigHat = make('big-hat', {materials: [silk]});

    ok(silk.get('hat') === bigHat);
  });


  test("when hasMany associations are assigned, belongsTo ( polymorphic ) parent is assigned", function () {
    var fluff = make('fluffy-material');
    var bigHat = make('big-hat', {fluffyMaterials: [fluff]});

    ok(fluff.get('hat') === bigHat);
  });


  test("when belongTo parent is assigned, parent adds to hasMany records", function () {
    var user = make('user');
    var project1 = make('project', {user: user});
    var project2 = make('project', {user: user});

    equal(user.get('projects.length'), 2);
    ok(user.get('projects.firstObject') === project1);
    ok(user.get('projects.lastObject') === project2);
  });


  test("when belongTo parent is assigned, parent adds to polymorphic hasMany records", function () {
    var user = make('user');
    make('big-hat', {user: user});
    make('small-hat', {user: user});

    equal(user.get('hats.length'), 2);
    ok(user.get('hats.firstObject') instanceof BigHat);
    ok(user.get('hats.lastObject') instanceof SmallHat);
  });


  test("when hasMany ( async ) relationship is assigned, model relationship is synced on both sides", function (assert) {
    Ember.run(function () {
      var done = assert.async();

      var property = make('property');
      var user1 = make('user', {properties: [property]});
      var user2 = make('user', {properties: [property]});

      equal(property.get('owners.length'), 2);
      ok(property.get('owners.firstObject') === user1);
      ok(property.get('owners.lastObject') === user2);
      done();
    });
  });


  test("when belongsTo ( async ) parent is assigned, parent adds to hasMany records", function (assert) {
    Ember.run(function () {
      var done = assert.async();

      var company = make('company');
      var user1 = make('user', {company: company});
      var user2 = make('user', {company: company});

      equal(company.get('users.length'), 2);
      ok(company.get('users.firstObject') === user1);
      ok(company.get('users.lastObject') === user2);
      done();
    });
  });


  test("when belongTo parent is assigned, parent adds to hasMany record using inverse", function () {
    var project = make('project');
    var project2 = make('project', {parent: project});

    equal(project.get('children.length'), 1);
    ok(project.get('children.firstObject') === project2);
  });


  test("when belongTo parent is assigned, parent adds to hasMany record using actual hasMany name", function () {
    var bh = make('big-hat');
    var silk = make('silk', {hat: bh});

    ok(bh.get('materials.firstObject') === silk);
  });


  test("when belongTo parent is assigned, parent adds to belongsTo record", function () {
    var company = make('company');
    var profile = make('profile', {company: company});
    ok(company.get('profile') === profile);

    // but guard against a situation where a model can belong to itself
    // and do not want to set the belongsTo on this case.
    var hat1 = make('big-hat');
    var hat2 = make('big-hat', {hat: hat1});
    ok(hat1.get('hat') === null);
    ok(hat2.get('hat') === hat1);
  });

  test("belongTo ( polymorphic ) association assigned in optional attributes", function () {
    var small_hat = make('small-hat');
    var feathers = make('feathers', {hat: small_hat});
    ok(feathers.get('hat') instanceof SmallHat);
  });

  test("belongTo ( polymorphic ) association assigned from traits", function () {
    var feathers = make('feathers', 'belonging_to_hat');
    ok(feathers.get('hat') instanceof SmallHat);
  });

  test("belongsTo associations defined as attributes in fixture", function () {
    var project = make('project_with_user');
    equal(project.get('user') instanceof User, true);
    ok(project.get('user.name') === 'User1');

    project = make('project_with_dude');
    ok(project.get('user.name') === 'Dude');

    project = make('project_with_admin');
    ok(project.get('user.name') === 'Admin');
  });


  test("hasMany associations defined as attributes in fixture", function () {
    var user = make('user_with_projects');
    equal(user.get('projects.length'), 2);
    ok(user.get('projects.firstObject.user') === user);
    ok(user.get('projects.lastObject.user') === user);
  });


  test("hasMany associations defined with traits", function () {
    var user = make('user', 'with_projects');
    equal(user.get('projects.length'), 2);
    ok(user.get('projects.firstObject.user') === user);
    ok(user.get('projects.lastObject.user') === user);
  });


  test("belongsTo associations defined with traits", function () {
    var hat1 = make('hat', 'with_user');
    equal(hat1.get('user') instanceof User, true);

    var hat2 = make('hat', 'with_user', 'with_outfit');
    equal(hat2.get('user') instanceof User, true);
    equal(hat2.get('outfit') instanceof Outfit, true);
  });


  test("with (nested json fixture) belongsTo has a hasMany association which has a belongsTo", function () {
    var project = make('project', 'with_user_having_hats_belonging_to_outfit');
    var user = project.get('user');
    var hats = user.get('hats');
    var firstHat = hats.get('firstObject');
    var lastHat = hats.get('lastObject');

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
      var property = FactoryGuy.make('property');
      ok(property.get('name') === 'Silly property(FOR SALE)');
    });
  });

  test("using afterMake with transient attributes in options", function () {
    Ember.run(function () {
      var property = FactoryGuy.make('property', {for_sale: false});
      ok(property.get('name') === 'Silly property');
    });
  });

};

SharedBehavior.makeListTests = function () {

  test("creates list of DS.Model instances", function () {
    var users = FactoryGuy.makeList('user', 2);
    equal(users.length, 2);
    ok(users[0] instanceof User);
    ok(users[1] instanceof User);
    equal(FactoryGuy.getStore().peekAll('user').get('content').length, 2);
  });

  test("handles trait arguments", function () {
    var users = FactoryGuy.makeList('user', 2, 'with_hats');
    equal(users.length, 2);
    equal(users[0].get('hats.length') === 2, true);
  });

  test("handles traits and optional fixture arguments", function () {
    var users = FactoryGuy.makeList('user', 2, 'with_hats', {name: 'Bob'});
    equal(users[0].get('name'), 'Bob');
    equal(users[0].get('hats.length') === 2, true);
  });

};


SharedBehavior.buildTests = function () {

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

    var json = build('person');
    var expected = {id: 1, name: 'person #1', type: 'normal'};
    deepEqual(json, actual('person',expected), 'in default attributes');

    json = build('dude');
    expected = {id: 2, name: 'person #2', type: 'person type #1'};
    deepEqual(json, actual('person',expected), 'in named attributes');

    throws(function () {
        build('bro');
      },
      MissingSequenceError,
      "throws error when sequence name not found"
    );

    json = build('dude_inline');
    expected = {id: 3, name: 'person #3', type: 'Dude #1'};
    deepEqual(json, actual('person',expected), 'as inline sequence function #1');


    json = build('dude_inline');
    expected = {id: 4, name: 'person #4', type: 'Dude #2'};
    deepEqual(json, actual('person',expected), 'as inline sequence function #2');
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

    var json = build('funny_person');
    var expected = {id: 1, name: 'Bob', type: 'funny Bob'};
    //if (FactoryGuy.useJSONAPI()) {
    //  expected = FactoryGuy.convertToJSONAPIFormat('person', expected);
    //}
    deepEqual(json, actual('person', expected), 'works when attribute exists');

    json = build('missing_person');
    expected = {id: 2, name: 'Bob', type: 'level undefined'};
    deepEqual(json, actual('person',expected), 'still works when attribute does not exists');
  });


  test("Using default belongsTo associations in attribute definition", function () {
    var json = build('project_with_user');
    var expected = {id: 1, title: 'Project1', user: {id: 1, name: 'User1'}};
    deepEqual(json, actual('project',expected));
  });

  test("creates association with optional attributes", function () {
    var json = build('project_with_dude');
    var expected = {
      id: 1,
      title: 'Project1',
      user: {id: 1, name: 'Dude'}
    };
    deepEqual(json, actual('project',expected));
  });


  test("creates association using named attribute", function () {
    var json = build('project_with_admin');
    var expected = {
      id: 1,
      title: 'Project1',
      user: {id: 1, name: 'Admin'}
    };
    deepEqual(json, actual('project',expected));
  });


  test("belongsTo association name differs from model name", function () {
    var json = build('project_with_parent');
    var expected = {
      id: 2,
      title: 'Project1',
      parent: {id: 1, title: 'Project2'}
    };
    deepEqual(json, actual('project',expected));
  });


  test("Using hasMany associations in attribute definition", function () {
    var json = build('user_with_projects');
    var expected = {
      id: 1,
      name: 'User1',
      projects: [{id: 1, title: 'Project1'}, {id: 2, title: 'Project2'}]
    };
    deepEqual(json, actual('user', expected));
  });


  test("with traits defining model attributes", function () {
    var json = build('project', 'big');
    var expected = {id: 1, title: 'Big Project'};
    deepEqual(json, actual('project',expected));
  });

  test("with traits defining belongsTo association", function () {
    var json = build('project', 'with_user');
    var expected = {
      id: 1, title: 'Project1', user: {id: 1, name: 'User1'}
    };
    deepEqual(json, actual('project',expected));
  });

  test("with more than one trait used", function () {
    var json = build('project', 'big', 'with_user');
    var expected = {
      id: 1, title: 'Big Project',
      user: {id: 1, name: 'User1'}
    };
    deepEqual(json, actual('project',expected));
  });

  test("with more than one trait and custom attributes", function () {
    var json = build('project', 'big', 'with_user', {title: 'Crazy Project'});
    var expected = {
      id: 1,
      title: 'Crazy Project',
      user: {id: 1, name: 'User1'}
    };
    deepEqual(json, actual('project',expected));
  });

  test("with trait with custom belongsTo association object", function () {
    var json = build('project', 'big', 'with_dude');
    var expected = {
      id: 1,
      title: 'Big Project',
      user: {id: 1, name: 'Dude'}
    };
    deepEqual(json, actual('project',expected));
  });

  test("using trait with attribute using FactoryGuy.belongsTo method", function () {
    var json = build('project', 'with_admin');
    var expected = {
      id: 1,
      title: 'Project1',
      user: {id: 1, name: 'Admin'}
    };
    deepEqual(json, actual('project',expected));
  });

  test("with attribute using sequence", function () {
    var json = build('project', 'with_title_sequence');
    var expected = {id: 1, title: 'Project1'};
    deepEqual(json, actual('project',expected));
  });

  test("with trait defining hasMany association", function () {
    var json = build('user', 'with_projects');
    var expected = {
      id: 1,
      name: 'User1',
      projects: [{id: 1, title: 'Project1'}, {id: 2, title: 'Project2'}]
    };
    deepEqual(json, actual('user',expected));
  });

  test("creates default json for model", function () {
    var json = build('user');
    var expected = {id: 1, name: 'User1'};
    deepEqual(json, actual('user',expected));
  });


  test("can override default model attributes", function () {
    var json = build('user', {name: 'bob'});
    var expected = {id: 1, name: 'bob'};
    deepEqual(json, actual('user',expected));
  });


  test("with named model definition with custom attributes", function () {
    var json = build('admin');
    var expected = {id: 1, name: 'Admin'};
    deepEqual(json, actual('user',expected));
  });


  test("overrides named model attributes", function () {
    var json = build('admin', {name: 'AdminGuy'});
    var expected = {id: 1, name: 'AdminGuy'};
    deepEqual(json, actual('user',expected));
  });


  test("ignores transient attributes", function () {
    var json = build('property');
    var expected = {id: 1, name: 'Silly property'};
    deepEqual(json, actual('property',expected));
  });
};


SharedBehavior.buildJSONAPITests = function () {

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

};

SharedBehavior.buildListTests = function () {

  test("basic", function () {
    var userList = buildList('user', 2);
    var expected = [{id: 1, name: 'User1'}, {id: 2, name: 'User2'}];
    //if (FactoryGuy.useJSONAPI()) {
    //  expected = FactoryGuy.convertToJSONAPIFormat('user', expected);
    //}
    deepEqual(userList, actual('user',expected));
  });

  test("using custom attributes", function () {
    var userList = buildList('user', 2, {name: 'Crazy'});
    var expected = [{id: 1, name: 'Crazy'}, {id: 2, name: 'Crazy'}];
    //if (FactoryGuy.useJSONAPI()) {
    //  expected = FactoryGuy.convertToJSONAPIFormat('user', expected);
    //}
    deepEqual(userList, actual('user',expected));
  });

  test("using traits", function () {
    var projectList = buildList('project', 2, 'big');
    var expected = [{id: 1, title: 'Big Project'}, {id: 2, title: 'Big Project'}];
    //if (FactoryGuy.useJSONAPI()) {
    //  expected = FactoryGuy.convertToJSONAPIFormat('project', expected);
    //}
    deepEqual(projectList, actual('project',expected));
  });

  test("using traits and custom attributes", function () {
    var projectList = buildList('project', 2, 'big', {title: 'Really Big'});
    var expected = [{id: 1, title: 'Really Big'}, {id: 2, title: 'Really Big'}];
    //if (FactoryGuy.useJSONAPI()) {
    //  expected = FactoryGuy.convertToJSONAPIFormat('project', expected);
    //}
    deepEqual(projectList, actual('project',expected));
  });

};


SharedBehavior.buildListJSONAPITests = function () {

  test("basic", function () {
    var userList = buildList('user', 2);
    deepEqual(userList, {
      data: [{
        id: 1,
        type: 'user',
        attributes: {
          name: 'User1'
        }
      },
        {
          id: 2,
          type: 'user',
          attributes: {
            name: 'User2'
          }
        }]
    });
  });

  test("using custom attributes", function () {
    var userList = buildList('user', 1, {name: 'Crazy'});
    deepEqual(userList, {
        data: [{
          id: 1,
          type: 'user',
          attributes: {
            name: 'Crazy'
          }
        },
        ]
      }
    );
  });


  test("using traits", function () {
    var projectList = buildList('project', 1, 'big');
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
    var projectList = buildList('project', 1, 'big', {title: 'Really Big'});
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