import Ember from 'ember';
import FactoryGuy, { build, make, makeList } from 'ember-data-factory-guy';
import TestHelper from 'ember-data-factory-guy/factory-guy-test-helper';

import SharedAdapterBehavior from './shared-adapter-tests';
import { title, inlineSetup } from '../helpers/utility-methods';

var App = null;
var adapter = 'DS.ActiveModelAdapter';
var adapterType = '-active-model';


SharedAdapterBehavior.all(adapter, adapterType);

module(title(adapter, 'FactoryGuyTestHelper#handleCreate'), inlineSetup(App, adapterType));

test("returns camelCase attributes", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    var customDescription = "special description";

    TestHelper.handleCreate('profile', {
      returns: {camel_case_description: customDescription}
    });

    FactoryGuy.getStore().createRecord('profile', {
      camel_case_description: 'description'
    }).save().then(function (profile) {
      ok(profile.get('camelCaseDescription') === customDescription);
      done();
    });
  });
});

module(title(adapter, 'FactoryGuy#build'), inlineSetup(App, adapterType));

test("using custom serialize keys function for transforming attributes and relationship keys", function () {
  var serializer = FactoryGuy.getStore().serializerFor();
  serializer.keyForAttribute = Ember.String.dasherize;
  serializer.keyForRelationship = Ember.String.dasherize;

  var json = build('profile', 'with_bat_man');
  deepEqual(json,
    {
      id: 1,
      description: 'Text goes here',
      'camel-case-description': 'textGoesHere',
      'snake-case-description': 'text_goes_here',
      'super-hero': {
        id: 1,
        type: "SuperHero",
        name: "BatMan"
      }
    });
});
