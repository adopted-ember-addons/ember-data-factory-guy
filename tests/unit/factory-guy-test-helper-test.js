import Ember from 'ember';
import FactoryGuy, { make, makeList } from 'ember-data-factory-guy';
import TestHelper from 'ember-data-factory-guy/factory-guy-test-helper';
import MissingSequenceError from 'ember-data-factory-guy/missing-sequence-error';

//import $ from 'jquery';
//import User from 'dummy/models/user';
//import BigHat from 'dummy/models/big-hat';
//import SmallHat from 'dummy/models/small-hat';
//import Outfit from 'dummy/models/outfit';
//import Profile from 'dummy/models/profile';

import startApp from '../helpers/start-app';
import { inlineSetup, theUsualSetup, theUsualTeardown } from '../helpers/utility-methods';

var App = null;
//var adapterType = '-json-api';

module('FactoryGuyTestHelper with DS.RESTAdapter', {
  teardown: function () {
    theUsualTeardown(App);
  }
});

//test("#buildURL without namespace", function () {
//  App = theUsualSetup('-rest');
//  equal(TestHelper.buildURL('project'), '/projects', 'has no namespace by default');
//});
//
//test("#buildURL with namespace and host", function () {
//  App = startApp();
//  var restAdapter = App.__container__.lookup('adapter:-rest');
//  var store = FactoryGuy.getStore();
//  store.adapterFor = function () {
//    return restAdapter;
//  };
//
//  restAdapter.setProperties({
//    host: 'https://dude.com',
//    namespace: 'api/v1'
//  });
//
//  equal(TestHelper.buildURL('project'), 'https://dude.com/api/v1/projects');
//});



///////// handleFindQuery //////////
//
//test("#handleFindQuery second argument should be an array", function (assert) {
//  assert.throws(function () {
//    TestHelper.handleFindQuery('user', 'name', {});
//  }, "second argument not correct type");
//});
//
//test("#handleFindQuery json payload argument should be an array", function (assert) {
//  assert.throws(function () {
//    TestHelper.handleFindQuery('user', ['name'], {});
//  }, "payload argument is not an array");
//});
//
//test("#handleFindQuery passing in nothing as last argument returns no results", function (assert) {
//  Ember.run(function () {
//    var done = assert.async();
//    TestHelper.handleFindQuery('user', ['name']);
//    store.findQuery('user', {name: 'Bob'}).then(function (users) {
//      equal(users.get('length'), 0);
//      done();
//    });
//  });
//});
//
//
//test("#handleFindQuery passing in existing instances returns those and does not create new ones", function (assert) {
//  Ember.run(function () {
//    var done = assert.async();
//    var users = FactoryGuy.makeList('user', 2, 'with_hats');
//    TestHelper.handleFindQuery('user', ['name'], users);
//
//    equal(store.peekAll('user').get('content.length'), 2, 'start out with 2 instances');
//
//    store.findQuery('user', {name: 'Bob'}).then(function (users) {
//      equal(users.get('length'), 2);
//      equal(users.get('firstObject.name'), 'User1');
//      equal(users.get('firstObject.hats.length'), 2);
//      equal(users.get('lastObject.name'), 'User2');
//      equal(store.peekAll('user').get('content.length'), 2, 'no new instances created');
//      done();
//    });
//  });
//});
//
//test("#handleFindQuery passing in existing instances with hasMany and belongsTo", function (assert) {
//  Ember.run(function () {
//    var done = assert.async();
//    var users = FactoryGuy.makeList('company', 2, 'with_projects', 'with_profile');
//    TestHelper.handleFindQuery('company', ['name'], users);
//
//    equal(store.peekAll('company').get('content.length'), 2, 'start out with 2 instances');
//
//    store.findQuery('company', {name: 'Dude'}).then(function (companies) {
//      equal(companies.get('length'), 2);
//      ok(companies.get('firstObject.profile') instanceof Profile);
//      equal(companies.get('firstObject.projects.length'), 2);
//      ok(companies.get('lastObject.profile') instanceof Profile);
//      equal(companies.get('lastObject.projects.length'), 2);
//      equal(store.peekAll('company').get('content.length'), 2, 'no new instances created');
//      done();
//    });
//  });
//});
//


//
//module('FactoryGuyTestHelper with DS.ActiveModelAdapter', {
//  setup: function () {
//    //App = theUsualSetup('-rest');
//    //App = theUsualSetup('-json-api');
//    App = theUsualSetup('-active-model');
//    store = FactoryGuy.getStore();
//  },
//  teardown: function () {
//    theUsualTeardown(App);
//  }
//});
//



/////// handleFindAll //////////


//test("#handleFindAll the basic", function (assert) {
//  Ember.run(function () {
//    var done = assert.async();
//    TestHelper.handleFindAll('profile', 2);
//
//    store.find('profile').then(function (profiles) {
//      ok(profiles.get('length') === 2);
//      ok(profiles.get('firstObject.description') === 'Text goes here');
//      done();
//    });
//  });
//});
//
//test("#handleFindAll with fixture options", function (assert) {
//  Ember.run(function () {
//    var done = assert.async();
//    TestHelper.handleFindAll('profile', 2, {description: 'dude'});
//
//    store.find('profile').then(function (profiles) {
//      ok(profiles.get('length') === 2);
//      ok(profiles.get('firstObject.description') === 'dude');
//      done();
//    });
//  });
//});
//
//test("#handleFindAll with traits", function (assert) {
//  Ember.run(function () {
//    var done = assert.async();
//    TestHelper.handleFindAll('profile', 2, 'goofy_description');
//
//    store.find('profile').then(function (profiles) {
//      ok(profiles.get('length') === 2);
//      ok(profiles.get('firstObject.description') === 'goofy');
//      done();
//    });
//  });
//});
//
//test("#handleFindAll with traits and fixture options", function (assert) {
//  Ember.run(function () {
//    var done = assert.async();
//    TestHelper.handleFindAll('profile', 2, 'goofy_description', {description: 'dude'});
//
//    store.find('profile').then(function (profiles) {
//      ok(profiles.get('length') === 2);
//      ok(profiles.get('firstObject.description') === 'dude');
//      done();
//    });
//  });
//});


