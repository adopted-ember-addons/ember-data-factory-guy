import Ember from 'ember';
import FactoryGuy, { build, buildList, make, makeList } from 'ember-data-factory-guy';

import SharedAdapterBehavior from './shared-adapter-tests';
import { title, inlineSetup } from '../helpers/utility-methods';

var App = null;
var adapter = 'DS.RESTAdapter';
var adapterType = '-rest';


SharedAdapterBehavior.all(adapter, adapterType);

module(title(adapter, 'FactoryGuy#build custom'), inlineSetup(App, adapterType));

test("sideloads belongsTo records", function (assert) {

  var buildJson = build('profile', 'with_bat_man');

  var expectedJson = {
    profile: {
      id: 1,
      description: 'Text goes here',
      camelCaseDescription: 'textGoesHere',
      snake_case_description: 'text_goes_here',
      superHero: 1,
    },
    'super-heros': [
      {
        id: 1,
        name: "BatMan",
        type: "SuperHero"
      }
    ]
  };

  deepEqual(buildJson, expectedJson);
});


test("sideloads hasMany records", function () {

  var buildJson = build('user', 'with_hats');

  var expectedJson = {
    user: {
      id: 1,
      name: 'User1',
      hats: [
        {type: 'big_hat', id:1},
        {type: 'big_hat', id:2}
      ],
    },
    'big-hats': [
      {id: 1, type: "BigHat" },
      {id: 2, type: "BigHat" }
    ]
  };

  deepEqual(buildJson, expectedJson);
});


module(title(adapter, 'FactoryGuy#buildList custom'), inlineSetup(App, adapterType));

test("sideloads belongsTo records", function (assert) {

  var buildJson = buildList('profile', 2, 'with_bat_man');

  var expectedJson = {
    profiles: [
      {
        id: 1,
        description: 'Text goes here',
        camelCaseDescription: 'textGoesHere',
        snake_case_description: 'text_goes_here',
        superHero: 1,
      },
      {
        id: 2,
        description: 'Text goes here',
        camelCaseDescription: 'textGoesHere',
        snake_case_description: 'text_goes_here',
        superHero: 2,
      }
    ],
    'super-heros': [
      {
        id: 1,
        name: "BatMan",
        type: "SuperHero"
      },
      {
        id: 2,
        name: "BatMan",
        type: "SuperHero"
      }
    ]
  };

  deepEqual(buildJson, expectedJson);
});


test("sideloads hasMany records", function () {

  var buildJson = buildList('user', 2, 'with_hats');

  var expectedJson = {
    users: [
      {
        id: 1,
        name: 'User1',
        hats: [
          {type: 'big_hat', id:1},
          {type: 'big_hat', id:2}
        ]
      },
      {
        id: 2,
        name: 'User2',
        hats: [
          {type: 'big_hat', id:3},
          {type: 'big_hat', id:4}
        ]
      }
    ],
    'big-hats': [
      {id: 1, type: "BigHat" },
      {id: 2, type: "BigHat" },
      {id: 3, type: "BigHat" },
      {id: 4, type: "BigHat" }
    ]
  };

  deepEqual(buildJson, expectedJson);
});
