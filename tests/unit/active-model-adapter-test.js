import Ember from 'ember';
import FactoryGuy, { build, buildList, make, makeList } from 'ember-data-factory-guy';
import TestHelper from 'ember-data-factory-guy/factory-guy-test-helper';

import SharedAdapterBehavior from './shared-adapter-tests';
import { title, inlineSetup } from '../helpers/utility-methods';

var App = null;
var adapter = 'DS.ActiveModelAdapter';
var adapterType = '-active-model';


SharedAdapterBehavior.all(adapter, adapterType);

module(title(adapter, 'FactoryGuyTestHelper#handleCreate custom'), inlineSetup(App, adapterType));

test("returns camelCase attributes", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    var customDescription = "special description";

    TestHelper.handleCreate('profile', {
      returns: {camel_case_description: customDescription}
    });

    FactoryGuy.get('store').createRecord('profile', {
      camel_case_description: 'description'
    }).save().then(function (profile) {
      ok(profile.get('camelCaseDescription') === customDescription);
      done();
    });
  });
});

module(title(adapter, 'FactoryGuy#build custom'), inlineSetup(App, adapterType));


test("sideloads belongsTo records which are built from fixture definition", function () {

  var buildJson = build('profile', 'with_bat_man');
  delete buildJson.unwrap;

  var expectedJson = {
    profile: {
      id: 1,
      description: 'Text goes here',
      camel_case_description: 'textGoesHere',
      snake_case_description: 'text_goes_here',
      a_boolean_field: false,
      super_hero_id: 1,
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

  var batMan = build('bat_man');
  var buildJson = build('profile', {superHero: batMan});
  delete buildJson.unwrap;

  var expectedJson = {
    profile: {
      id: 1,
      description: 'Text goes here',
      camel_case_description: 'textGoesHere',
      snake_case_description: 'text_goes_here',
      a_boolean_field: false,
      super_hero_id: 1,
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

test("sideloads hasMany records built from fixture definition", function () {

  var buildJson = build('user', 'with_hats');
  delete buildJson.unwrap;

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

test("sideloads hasMany records passed as ( prebuilt ) attribute", function () {

  var hats = buildList('big-hat', 2);
  var buildJson = build('user', {hats: hats});
  delete buildJson.unwrap;

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


test("using custom serialize keys function for transforming attributes and relationship keys", function () {
  var serializer = FactoryGuy.get('store').serializerFor();

  var savedKeyForAttributeFn = serializer.keyForAttribute;
  serializer.keyForAttribute = Ember.String.dasherize;
  var savedKeyForRelationshipFn = serializer.keyForRelationship;
  serializer.keyForRelationship = Ember.String.dasherize;

  var buildJson = build('profile', 'with_bat_man');
  delete buildJson.unwrap;

  var expectedJson = {
    profile: {
      id: 1,
      description: 'Text goes here',
      'camel-case-description': 'textGoesHere',
      'snake-case-description': 'text_goes_here',
      'a-boolean-field': false,
      'super-hero': 1,
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

  serializer.keyForAttribute = savedKeyForAttributeFn;
  serializer.keyForRelationship = savedKeyForRelationshipFn;
});

test("serializes attributes with custom type", function () {
  var info = {first: 1};
  var buildJson = build('user', {info: info});
  delete buildJson.unwrap;

  var expectedJson = {
    user: {
      id: 1,
      name: 'User1',
      info: '{"first":1}'
    }
  };

  deepEqual(buildJson, expectedJson);
});
