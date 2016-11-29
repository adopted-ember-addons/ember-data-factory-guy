import {moduleFor, test} from 'ember-qunit';
import { build, buildList, make, makeList, mockFindRecord, mockFindAll } from 'ember-data-factory-guy';

import SharedAdapterBehavior from './shared-adapter-tests';
import SharedFactoryGuyTestHelperBehavior from './shared-factory-guy-test-helper-tests';
import { inlineSetup } from '../helpers/utility-methods';

let serializer = 'DS.RESTAdapter/JSONSerializer';
let serializerType = '-json';

SharedAdapterBehavior.all(serializer, serializerType);

SharedFactoryGuyTestHelperBehavior.mockFindRecordEmbeddedTests(serializer, serializerType);
SharedFactoryGuyTestHelperBehavior.mockFindAllEmbeddedTests(serializer, serializerType);

SharedFactoryGuyTestHelperBehavior.mockUpdateWithErrorMessages(serializer, serializerType);
SharedFactoryGuyTestHelperBehavior.mockUpdateReturnsEmbeddedAssociations(serializer, serializerType);

SharedFactoryGuyTestHelperBehavior.mockCreateReturnsEmbeddedAssociations(serializer, serializerType);
SharedFactoryGuyTestHelperBehavior.mockCreateFailsWithErrorResponse(serializer, serializerType);

moduleFor('serializer:application', `${serializer} FactoryGuy#build get`, inlineSetup(serializerType));

test("returns all attributes with no key", function(assert) {
  let user = build('user');
  assert.deepEqual(user.get(), { id: 1, name: 'User1', style: "normal" });
  assert.equal(user.get().id, 1);
  assert.equal(user.get().name, 'User1');
});

test("returns an attribute with a key", function(assert) {
  let user = build('user');
  assert.equal(user.get('id'), 1);
  assert.equal(user.get('name'), 'User1');
});

moduleFor('serializer:application', `${serializer} FactoryGuy#buildList get`, inlineSetup(serializerType));

test("returns array of all attributes with no key", function(assert) {
  let users = buildList('user', 2);
  assert.deepEqual(users.get(), [{ id: 1, name: 'User1', style: "normal" }, { id: 2, name: 'User2', style: "normal" }]);
});

test("returns an attribute with a key", function(assert) {
  let users = buildList('user', 2);
  assert.deepEqual(users.get(0), { id: 1, name: 'User1', style: "normal" });
  assert.equal(users.get(0).id, 1);
  assert.deepEqual(users.get(1), { id: 2, name: 'User2', style: "normal" });
  assert.equal(users.get(1).name, 'User2');
});

moduleFor('serializer:application', `${serializer} FactoryGuy#build custom`, inlineSetup(serializerType));

test("belongsTo ( not polymorphic ) record as id", function(assert) {
  let company = build('company');
  let buildJson = build('property', { company });
  buildJson.unwrap();

  let expectedJson = {
    id: 1,
    name: 'Silly property',
    company: 1
  };

  assert.deepEqual(buildJson, expectedJson);
});

test("hasMany ( not polymorphic ) records as ids", function(assert) {
  let owners = buildList('user', 2);
  let buildJson = build('property', { owners });
  buildJson.unwrap();

  let expectedJson = {
    id: 1,
    name: 'Silly property',
    owners: [1, 2]
  };

  assert.deepEqual(buildJson, expectedJson);
});

test("embeds belongsTo record when serializer attrs => embedded: always ", function(assert) {

  let buildJson = build('comic-book', 'marvel');
  buildJson.unwrap();

  let expectedJson = {
    id: 1,
    name: 'Comic Times #1',
    company: { id: 1, type: 'Company', name: 'Marvel Comics' }
  };

  assert.deepEqual(buildJson, expectedJson);
});

test("embeds belongsTo record passed as prebuilt ( build ) json when serializer attrs => embedded: always ", function(assert) {
  let marvel = build('marvel');
  let buildJson = build('comic-book', { company: marvel });
  buildJson.unwrap();

  let expectedJson = {
    id: 1,
    name: 'Comic Times #1',
    company: { id: 1, type: 'Company', name: 'Marvel Comics' }
  };

  assert.deepEqual(buildJson, expectedJson);
});

test("embeds hasMany records when serializer attrs => embedded: always", function(assert) {

  let buildJson = build('comic-book', 'with_bad_guys');
  buildJson.unwrap();

  let expectedJson = {
    id: 1,
    name: 'Comic Times #1',
    characters: [
      { id: 1, type: 'Villain', name: 'BadGuy#1' },
      { id: 2, type: 'Villain', name: 'BadGuy#2' }
    ]
  };

  assert.deepEqual(buildJson, expectedJson);
});

test("embeds hasMany records passed as prebuilt ( buildList ) json when serializer attrs => embedded: always", function(assert) {
  let badGuys = buildList('villain', 2);
  let buildJson = build('comic-book', { characters: badGuys });
  buildJson.unwrap();

  let expectedJson = {
    id: 1,
    name: 'Comic Times #1',
    characters: [
      { id: 1, type: 'Villain', name: 'BadGuy#1' },
      { id: 2, type: 'Villain', name: 'BadGuy#2' }
    ]
  };

  assert.deepEqual(buildJson, expectedJson);
});

// Nov 4 2016 => not sure why these tests for manager model are here because this
// model is  REST model using EmbeddedRecordsMixin which is not compatible with JSONSerializer
// so what did I put tests for that here ?? can't remember

//test("embeds belongsTo record when serializer attrs => deserialize: 'records' ", function(assert) {
//
//  let buildJson = build('manager', 'withSalary');
//  buildJson.unwrap();
//
//  let expectedJson = {
//    id: 1,
//    name: {
//      firstName: "Tyrion",
//      lastName: "Lannister"
//    },
//    salary: {
//      id: 1,
//      income: 90000,
//      benefits: ['health', 'company car', 'dental']
//    }
//  };
//
//  assert.deepEqual(buildJson, expectedJson);
//});
//
//test("embeds belongsTo record passed as prebuilt ( build ) json when serializer attrs => deserialize: 'records' ", function(assert) {
//  let salary = build('salary');
//  let buildJson = build('manager', { salary: salary });
//  buildJson.unwrap();
//
//  let expectedJson = {
//    id: 1,
//    name: {
//      firstName: "Tyrion",
//      lastName: "Lannister"
//    },
//    salary: {
//      id: 1,
//      income: 90000,
//      benefits: ['health', 'company car', 'dental']
//    }
//  };
//
//  assert.deepEqual(buildJson, expectedJson);
//});
//
//test("embeds hasMany records when serializer attrs => deserialize: 'records'", function(assert) {
//
//  let buildJson = build('manager', 'with_reviews');
//  buildJson.unwrap();
//
//  let expectedJson = {
//    id: 1,
//    name: {
//      firstName: "Tyrion",
//      lastName: "Lannister"
//    },
//    reviews: [
//      {
//        id: 1,
//        rating: 1,
//        date: "2015-05-01T00:00:00.000Z"
//      },
//      {
//        id: 2,
//        rating: 2,
//        date: "2015-05-01T00:00:00.000Z"
//      }
//    ]
//  };
//
//  assert.deepEqual(buildJson, expectedJson);
//});
//
//test("embeds hasMany records passed as prebuilt ( buildList ) json when serializer attrs => deserialize: 'records'", function(assert) {
//  let reviews = buildList('review', 2);
//  let buildJson = build('manager', { reviews: reviews });
//  buildJson.unwrap();
//
//  let expectedJson = {
//    id: 1,
//    name: {
//      firstName: "Tyrion",
//      lastName: "Lannister"
//    },
//    reviews: [
//      {
//        id: 1,
//        rating: 1,
//        date: "2015-05-01T00:00:00.000Z"
//      },
//      {
//        id: 2,
//        rating: 2,
//        date: "2015-05-01T00:00:00.000Z"
//      }
//    ]
//  };
//
//  assert.deepEqual(buildJson, expectedJson);
//});

// the override for primaryKey is in the helpers/utilityMethods.js
test("serializer primaryKey override", function(assert) {
  let json = build('cat');
  assert.equal(json.get('catId'), 1);
  assert.equal(json.get('id'), 1);
});

test("serializes attributes with custom type", function(assert) {
  let info = { first: 1 };
  let buildJson = build('user', { info: info });
  buildJson.unwrap();

  let expectedJson = {
    id: 1,
    name: 'User1',
    style: "normal",
    info: '{"first":1}'
  };

  assert.deepEqual(buildJson, expectedJson);
});
