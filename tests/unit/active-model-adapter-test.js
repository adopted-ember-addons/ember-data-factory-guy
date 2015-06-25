import Ember from 'ember';
import FactoryGuy, { make, makeList } from 'ember-data-factory-guy';
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