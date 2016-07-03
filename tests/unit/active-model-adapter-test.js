import Ember from 'ember';
import FactoryGuy, {build, buildList, make, makeList, mockCreate} from 'ember-data-factory-guy';

import SharedAdapterBehavior from './shared-adapter-tests';
import SharedFactoryGuyTestHelperBehavior from './shared-factory-guy-test-helper-tests';
import {title, inlineSetup} from '../helpers/utility-methods';

let App = null;
let adapter = 'DS.ActiveModelAdapter';
let serializerType = '-active-model';

SharedAdapterBehavior.all(adapter, serializerType);

SharedFactoryGuyTestHelperBehavior.mockFindSideloadingTests(App, adapter, serializerType);
SharedFactoryGuyTestHelperBehavior.mockFindAllSideloadingTests(App, adapter, serializerType);

SharedFactoryGuyTestHelperBehavior.mockQueryMetaTests(App, adapter, serializerType);

SharedFactoryGuyTestHelperBehavior.mockUpdateWithErrorMessages(App, adapter, serializerType);
SharedFactoryGuyTestHelperBehavior.mockUpdateReturnsAssociations(App, adapter, serializerType);
SharedFactoryGuyTestHelperBehavior.mockUpdateReturnsEmbeddedAssociations(App, adapter, serializerType);

SharedFactoryGuyTestHelperBehavior.mockCreateReturnsAssociations(App, adapter, serializerType);
SharedFactoryGuyTestHelperBehavior.mockCreateFailsWithErrorResponse(App, adapter, serializerType);
SharedFactoryGuyTestHelperBehavior.mockCreateReturnsEmbeddedAssociations(App, adapter, serializerType);

module(title(adapter, '#mockCreate custom'), inlineSetup(App, serializerType));

test("returns camelCase attributes", function(assert) {
  Ember.run(()=> {
    let done = assert.async();
    let customDescription = "special description";

    mockCreate('profile').returns({ camel_case_description: customDescription });

    FactoryGuy.store.createRecord('profile', { camel_case_description: 'description' })
      .save().then((profile)=> {
        ok(profile.get('camelCaseDescription') === customDescription);
        done();
      });
  });
});

module(title(adapter, 'FactoryGuy#build custom'), inlineSetup(App, serializerType));

test("embeds belongsTo record when serializer attrs => embedded: always ", function() {

  let buildJson = build('comic-book', 'marvel');
  buildJson.unwrap();

  let expectedJson = {
    comic_book: {
      id: 1,
      name: 'Comic Times #1',
      company: { id: 1, type: 'Company', name: 'Marvel Comics' }
    }
  };

  deepEqual(buildJson, expectedJson);
});


test("sideloads belongsTo records which are built from fixture definition", function() {

  let buildJson = build('profile', 'with_bat_man');
  buildJson.unwrap();

  let expectedJson = {
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

test("sideloads belongsTo record passed as ( prebuilt ) attribute", function() {

  let batMan = build('bat_man');
  let buildJson = build('profile', { superHero: batMan });
  buildJson.unwrap();

  let expectedJson = {
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

test("sideloads hasMany records built from fixture definition", function() {

  let buildJson = build('user', 'with_hats');
  buildJson.unwrap();

  let expectedJson = {
    user: {
      id: 1,
      name: 'User1',
      style: "normal",
      hats: [
        { type: 'big_hat', id: 1 },
        { type: 'big_hat', id: 2 }
      ],
    },
    'big-hats': [
      { id: 1, type: "BigHat" },
      { id: 2, type: "BigHat" }
    ]
  };

  deepEqual(buildJson, expectedJson);
});


test("sideloads hasMany records passed as prebuilt ( buildList ) attribute", function() {

  let hats = buildList('big-hat', 2);
  let buildJson = build('user', { hats: hats });
  buildJson.unwrap();

  let expectedJson = {
    user: {
      id: 1,
      name: 'User1',
      style: "normal",
      hats: [
        { type: 'big_hat', id: 1 },
        { type: 'big_hat', id: 2 }
      ],
    },
    'big-hats': [
      { id: 1, type: "BigHat" },
      { id: 2, type: "BigHat" }
    ]
  };

  deepEqual(buildJson, expectedJson);
});


test("sideloads hasMany records passed as prebuilt ( array of build ) attribute", function() {

  let hat1 = build('big-hat');
  let hat2 = build('big-hat');
  let buildJson = build('user', { hats: [hat1, hat2] });
  buildJson.unwrap();

  let expectedJson = {
    user: {
      id: 1,
      name: 'User1',
      style: "normal",
      hats: [
        { type: 'big_hat', id: 1 },
        { type: 'big_hat', id: 2 }
      ],
    },
    'big-hats': [
      { id: 1, type: "BigHat" },
      { id: 2, type: "BigHat" }
    ]
  };

  deepEqual(buildJson, expectedJson);
});


test("using custom serialize keys function for transforming attributes and relationship keys", function() {
  let serializer = FactoryGuy.store.serializerFor('application');

  let savedKeyForAttributeFn = serializer.keyForAttribute;
  serializer.keyForAttribute = Ember.String.dasherize;
  let savedKeyForRelationshipFn = serializer.keyForRelationship;
  serializer.keyForRelationship = Ember.String.dasherize;

  let buildJson = build('profile', 'with_bat_man');
  buildJson.unwrap();

  let expectedJson = {
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

test("serializes attributes with custom type", function() {
  let info = { first: 1 };
  let buildJson = build('user', { info: info });
  buildJson.unwrap();

  let expectedJson = {
    user: {
      id: 1,
      name: 'User1',
      style: "normal",
      info: '{"first":1}'
    }
  };

  deepEqual(buildJson, expectedJson);
});
