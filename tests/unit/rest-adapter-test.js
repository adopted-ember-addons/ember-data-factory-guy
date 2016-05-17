import Ember from 'ember';
import FactoryGuy, { build, buildList, make, makeList, mockFind, mockFindAll } from 'ember-data-factory-guy';

import SharedAdapterBehavior from './shared-adapter-tests';
import SharedFactoryGuyTestHelperBehavior from './shared-factory-guy-test-helper-tests';
import { title, inlineSetup } from '../helpers/utility-methods';

let App = null;
let adapter = 'DS.RESTAdapter';
let serializerType = '-rest';

SharedAdapterBehavior.all(adapter, serializerType);

SharedFactoryGuyTestHelperBehavior.mockFindSideloadingTests(App, adapter, serializerType);
SharedFactoryGuyTestHelperBehavior.mockFindAllSideloadingTests(App, adapter, serializerType);

SharedFactoryGuyTestHelperBehavior.mockFindEmbeddedTests(App, adapter, serializerType);
SharedFactoryGuyTestHelperBehavior.mockFindAllEmbeddedTests(App, adapter, serializerType);


module(title(adapter, 'FactoryGuy#build get'), inlineSetup(App, serializerType));

test("returns all attributes with no key", function() {
  let user = build('user');
  deepEqual(user.get(), { id: 1, name: 'User1', style: "normal" });
  equal(user.get().id, 1);
  equal(user.get().name, 'User1');
});

test("returns an attribute for a key", function() {
  let user = build('user');
  equal(user.get('id'), 1);
  equal(user.get('name'), 'User1');
});


module(title(adapter, 'FactoryGuy#buildList get'), inlineSetup(App, serializerType));

test("returns array of all attributes with no key", function() {
  let users = buildList('user', 2);
  deepEqual(users.get(), [{ id: 1, name: 'User1', style: "normal" }, { id: 2, name: 'User2', style: "normal" }]);
});

test("returns an attribute with a key", function() {
  let users = buildList('user', 2);
  deepEqual(users.get(0), { id: 1, name: 'User1', style: "normal" });
  equal(users.get(0).id, 1);
  deepEqual(users.get(1), { id: 2, name: 'User2', style: "normal" });
  equal(users.get(1).name, 'User2');
});

module(title(adapter, 'FactoryGuy#build custom'), inlineSetup(App, serializerType));

test("sideloads belongsTo records which are built from fixture definition that just has empty object {}", function() {
  let buildJson = build('user', 'with_company');
  buildJson.unwrap();

  let expectedJson = {
    user: {
      id: 1,
      name: 'User1',
      style: "normal",
      company: { id: 1, type: 'company' }
    },
    companies: [
      { id: 1, type: 'Company', name: "Silly corp" }
    ]
  };

  deepEqual(buildJson, expectedJson);
});

test("sideloads belongsTo records which are built from fixture definition with FactoryGuy.belongsTo", function() {

  let buildJson = build('profile', 'with_bat_man');
  buildJson.unwrap();

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

test("sideloads belongsTo record passed as ( prebuilt ) json", function() {

  let batMan = build('bat_man');
  let buildJson = build('profile', { superHero: batMan });
  buildJson.unwrap();

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

test("sideloads 2 levels of relationships ( build => belongsTo , build => belongsTo )", function() {

  let company = build('company');
  let user = build('user', { company });
  let buildJson = build('project', { user });
  buildJson.unwrap();

  let expectedJson = {
    project: {
      id: 1,
      title: 'Project1',
      user: 1,
    },
    users: [
      {
        id: 1,
        name: "User1",
        company: { id: 1, type: "company" },
        style: "normal"
      }
    ],
    companies: [
      {
        id: 1,
        type: 'Company',
        name: "Silly corp"
      }
    ]
  };

  deepEqual(buildJson, expectedJson);
});


test("sideloads 2 levels of records ( buildList => hasMany , build => belongsTo )", function() {
  let hats = buildList('big-hat', 2, 'square');
  let user = build('user', { hats });
  let buildJson = build('project', { user });
  buildJson.unwrap();

  let expectedJson = {
    project: {
      id: 1,
      title: 'Project1',
      user: 1
    },
    users: [
      {
        id: 1,
        name: "User1",
        hats: [{ id: 1, type: "big_hat" }, { id: 2, type: "big_hat" }],
        style: "normal"
      }
    ],
    'big-hats': [
      {
        id: 1,
        type: 'BigHat',
        shape: 'square'
      },
      {
        id: 2,
        type: 'BigHat',
        shape: 'square'
      }
    ]
  };

  deepEqual(buildJson, expectedJson);
});


test("sideloads 2 levels of records ( build => belongsTo,  buildList => hasMany )", function() {
  let company1 = build('company', { name: 'A Corp' });
  let company2 = build('company', { name: 'B Corp' });
  let owners = buildList('user', { company: company1 }, { company: company2 });
  let buildJson = build('property', { owners });
  buildJson.unwrap();

  let expectedJson = {
    property: {
      id: 1,
      name: 'Silly property',
      owners: [1, 2]
    },
    users: [
      {
        id: 1,
        name: "User1",
        company: { id: 1, type: "company" },
        style: "normal"
      },
      {
        id: 2,
        name: "User2",
        company: { id: 2, type: "company" },
        style: "normal"
      }
    ],
    companies: [
      {
        id: 1,
        type: 'Company',
        name: "A Corp"
      },
      {
        id: 2,
        type: 'Company',
        name: "B Corp"
      }
    ]
  };

  deepEqual(buildJson, expectedJson);
});


test("sideloads hasMany records which are built from fixture definition", function() {

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

test("sideloads hasMany records passed as prebuilt ( buildList ) json", function() {

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


test("sideloads hasMany records passed as prebuilt ( array of build ) json", function() {

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

test("sideloads unrelated record passed as prebuilt ( build ) json", function() {

  let batMan = build('bat_man');
  let buildJson = build('user').add(batMan);
  buildJson.unwrap();

  let expectedJson = {
    user: {
      id: 1,
      name: 'User1',
      style: "normal"
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

test("sideloads unrelated record passed as prebuilt ( buildList ) json", function() {

  let batMen = buildList('bat_man', 2);
  let buildJson = build('user').add(batMen);
  buildJson.unwrap();

  let expectedJson = {
    user: {
      id: 1,
      name: 'User1',
      style: "normal"
    },
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

test("embeds belongsTo record when serializer attrs => embedded: always ", function() {

  let buildJson = build('comic-book', 'marvel');
  buildJson.unwrap();

  let expectedJson = {
    comicBook: {
      id: 1,
      name: 'Comic Times #1',
      company: { id: 1, type: 'Company', name: 'Marvel Comics' }
    }
  };

  deepEqual(buildJson, expectedJson);
});

test("embeds belongsTo record passed as prebuilt ( build ) json when serializer attrs => embedded: always ", function() {
  let marvel = build('marvel');
  let buildJson = build('comic-book', { company: marvel });
  buildJson.unwrap();

  let expectedJson = {
    comicBook: {
      id: 1,
      name: 'Comic Times #1',
      company: { id: 1, type: 'Company', name: 'Marvel Comics' }
    }
  };

  deepEqual(buildJson, expectedJson);
});

test("embeds hasMany records when serializer attrs => embedded: always", function() {

  let buildJson = build('comic-book', 'with_bad_guys');
  buildJson.unwrap();

  let expectedJson = {
    comicBook: {
      id: 1,
      name: 'Comic Times #1',
      characters: [
        { id: 1, type: 'Villain', name: 'BadGuy#1' },
        { id: 2, type: 'Villain', name: 'BadGuy#2' }
      ]
    }
  };

  deepEqual(buildJson, expectedJson);
});

test("embeds hasMany records passed as prebuilt ( buildList ) json when serializer attrs => embedded: always", function() {
  let badGuys = buildList('villain', 2);
  let buildJson = build('comic-book', { characters: badGuys });
  buildJson.unwrap();

  let expectedJson = {
    comicBook: {
      id: 1,
      name: 'Comic Times #1',
      characters: [
        { id: 1, type: 'Villain', name: 'BadGuy#1' },
        { id: 2, type: 'Villain', name: 'BadGuy#2' }
      ]
    }
  };

  deepEqual(buildJson, expectedJson);
});

test("embeds belongsTo record when serializer attrs => deserialize: 'records' ", function() {

  let buildJson = build('manager', 'with_salary');
  buildJson.unwrap();

  let expectedJson = {
    manager: {
      id: 1,
      name: {
        firstName: "Tyrion",
        id: 1,
        lastName: "Lannister"
      },
      salary: {
        id: 1,
        income: 90000,
        benefits: ['health', 'company car', 'dental']
      }
    }
  };

  deepEqual(buildJson, expectedJson);
});

test("embeds belongsTo record passed as prebuilt ( build ) json when serializer attrs => deserialize: 'records' ", function() {
  let salary = build('salary');
  let buildJson = build('manager', { salary: salary });
  buildJson.unwrap();

  let expectedJson = {
    manager: {
      id: 1,
      name: {
        firstName: "Tyrion",
        id: 1,
        lastName: "Lannister"
      },
      salary: {
        id: 1,
        income: 90000,
        benefits: ['health', 'company car', 'dental']
      }
    }
  };

  deepEqual(buildJson, expectedJson);
});

test("embeds hasMany records when serializer attrs => deserialize: 'records'", function() {

  let buildJson = build('manager', 'with_reviews');
  buildJson.unwrap();

  let expectedJson = {
    manager: {
      id: 1,
      name: {
        firstName: "Tyrion",
        id: 1,
        lastName: "Lannister"
      },
      reviews: [
        {
          id: 1,
          rating: 1,
          date: "2015-05-01T00:00:00.000Z"
        },
        {
          id: 2,
          rating: 2,
          date: "2015-05-01T00:00:00.000Z"
        }
      ]
    }
  };

  deepEqual(buildJson, expectedJson);
});

test("embeds hasMany records passed as prebuilt ( buildList ) json when serializer attrs => deserialize: 'records'", function() {
  let reviews = buildList('review', 2);
  let buildJson = build('manager', { reviews: reviews });
  buildJson.unwrap();

  let expectedJson = {
    manager: {
      id: 1,
      name: {
        firstName: "Tyrion",
        id: 1,
        lastName: "Lannister"
      },
      reviews: [
        {
          id: 1,
          rating: 1,
          date: "2015-05-01T00:00:00.000Z"
        },
        {
          id: 2,
          rating: 2,
          date: "2015-05-01T00:00:00.000Z"
        }
      ]
    }
  };

  deepEqual(buildJson, expectedJson);
});

// the override for primaryKey is in the helpers/utilityMethods.js
test("serializer primaryKey override", function() {
  let json = build('cat');
  equal(json.get('catId'), 1);
  equal(json.get('id'), 1);
});

module(title(adapter, 'FactoryGuy#buildList custom'), inlineSetup(App, serializerType));

test("sideloads belongsTo records", function() {

  let buildJson = buildList('profile', 2, 'with_bat_man');
  buildJson.unwrap();

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


test("sideloads hasMany records", function() {

  let buildJson = buildList('user', 2, 'with_hats');
  buildJson.unwrap();

  let expectedJson = {
    users: [
      {
        id: 1,
        name: 'User1',
        style: "normal",
        hats: [
          { type: 'big_hat', id: 1 },
          { type: 'big_hat', id: 2 }
        ]
      },
      {
        id: 2,
        name: 'User2',
        style: "normal",
        hats: [
          { type: 'big_hat', id: 3 },
          { type: 'big_hat', id: 4 }
        ]
      }
    ],
    'big-hats': [
      { id: 1, type: "BigHat" },
      { id: 2, type: "BigHat" },
      { id: 3, type: "BigHat" },
      { id: 4, type: "BigHat" }
    ]
  };

  deepEqual(buildJson, expectedJson);
});

test("serializes custom attributes types", function() {
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

test("uses serializers payloadKeyFromModelName function", function() {
  let serializer = FactoryGuy.store.serializerFor('application');
  let savedPayloadKeyFromModelNameFn = serializer.payloadKeyFromModelName;
  serializer.payloadKeyFromModelName = function() {
    return "dude";
  };

  let buildJson = build('user');
  buildJson.unwrap();

  let expectedJson = {
    dude: {
      id: 1,
      name: 'User1',
      style: "normal"
    }
  };

  deepEqual(buildJson, expectedJson);

  serializer.payloadKeyFromModelName = savedPayloadKeyFromModelNameFn;
});