import Ember from 'ember';
import FactoryGuy, { build, buildList, make, makeList } from 'ember-data-factory-guy';

import SharedAdapterBehavior from './shared-adapter-tests';
import { title, inlineSetup } from '../helpers/utility-methods';

let App = null;
let adapter = 'DS.RESTAdapter';
let adapterType = '-rest';

SharedAdapterBehavior.all(adapter, adapterType);

module(title(adapter, 'FactoryGuy#build custom'), inlineSetup(App, adapterType));

test("sideloads belongsTo records which are built from fixture definition", function () {

  let buildJson = build('profile', 'with_bat_man');
  delete buildJson.unwrap;

  let expectedJson = {
    profile: {
      id: 1,
      description: 'Text goes here',
      camelCaseDescription: 'textGoesHere',
      snake_case_description: 'text_goes_here',
      aBooleanField: false,
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

test("sideloads belongsTo record passed as ( prebuilt ) attribute", function () {

  let batMan = build('bat_man');
  let buildJson = build('profile', {superHero: batMan});
  delete buildJson.unwrap;

  let expectedJson = {
    profile: {
      id: 1,
      description: 'Text goes here',
      camelCaseDescription: 'textGoesHere',
      snake_case_description: 'text_goes_here',
      aBooleanField: false,
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

test("sideloads hasMany records which are built from fixture definition", function () {

  let buildJson = build('user', 'with_hats');
  delete buildJson.unwrap;

  let expectedJson = {
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

test("sideloads hasMany records passed as prebuilt ( buildList ) attribute", function () {

  let hats = buildList('big-hat', 2);
  let buildJson = build('user', {hats: hats});
  delete buildJson.unwrap;

  let expectedJson = {
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


test("sideloads hasMany records passed as prebuilt ( array of build ) attribute", function () {

  let hat1 = build('big-hat');
  let hat2 = build('big-hat');
  let buildJson = build('user', {hats: [hat1, hat2]});
  delete buildJson.unwrap;

  let expectedJson = {
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

test("sideloads belongsTo records", function () {

  let buildJson = buildList('profile', 2, 'with_bat_man');
  delete buildJson.unwrap;

  let expectedJson = {
    profiles: [
      {
        id: 1,
        description: 'Text goes here',
        camelCaseDescription: 'textGoesHere',
        snake_case_description: 'text_goes_here',
        aBooleanField: false,
        superHero: 1,
      },
      {
        id: 2,
        description: 'Text goes here',
        camelCaseDescription: 'textGoesHere',
        snake_case_description: 'text_goes_here',
        aBooleanField: false,
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

  let buildJson = buildList('user', 2, 'with_hats');
  delete buildJson.unwrap;

  let expectedJson = {
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

test("serializes attributes with custom type", function () {
  let info = {first: 1};
  let buildJson = build('user', {info: info});
  delete buildJson.unwrap;

  let expectedJson = {
    user: {
      id: 1,
      name: 'User1',
      info: '{"first":1}'
    }
  };

  deepEqual(buildJson, expectedJson);
});
