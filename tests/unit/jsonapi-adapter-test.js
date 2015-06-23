import Ember from 'ember';
import FactoryGuy, { make, build } from 'ember-data-factory-guy';
import { theUsualSetup, theUsualTeardown } from '../helpers/utility-methods';

import User from 'dummy/models/user';
import BigHat from 'dummy/models/big-hat';
import SmallHat from 'dummy/models/small-hat';
import Outfit from 'dummy/models/outfit';

var App, store;

module('FactoryGuy with DS.JSONAPIAdapter', {
  setup: function () {
    App = theUsualSetup('-json-api');
    store = FactoryGuy.getStore();
  },
  teardown: function () {
    theUsualTeardown(App);
  }
});

test("#build with (nested json fixture) belongsTo has a hasMany association which has a belongsTo", function () {

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

test("#make with (nested json fixture) belongsTo has a hasMany association which has a belongsTo", function () {
  var project = make('project', 'with_user_having_hats_belonging_to_outfit');

  var user = project.get('user');
  var hats = user.get('hats');
  var firstHat = hats.get('firstObject');
  var lastHat = hats.get('lastObject');

  ok(user.get('projects.firstObject') === project);
  ok(firstHat.get('user') === user);
  ok(firstHat.get('outfit.id') === '1');

  var outfit1 = firstHat.get('outfit');
  ok(outfit1.get('hats.length') === 1);
  ok(firstHat.get('outfit.hats.firstObject') === firstHat);

  ok(lastHat.get('user') === user);
  ok(lastHat.get('outfit.id') === '2');
  ok(lastHat.get('outfit.hats.length') === 1);
  ok(lastHat.get('outfit.hats.firstObject') === lastHat);

});
