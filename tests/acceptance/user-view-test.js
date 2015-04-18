import Ember from 'ember';

import { make } from 'ember-data-factory-guy';
import TestHelper from 'ember-data-factory-guy/factory-guy-test-helper';

import startApp from '../helpers/start-app';

var App, user;

module('User View', {
  beforeEach: function () {
    Ember.run(function () {
      App = startApp();
      TestHelper.setup();
    });
  },
  afterEach: function () {
    Ember.run(function () {
      TestHelper.teardown();
      App.destroy();
    });
  }
});


test("Creates new project", function () {
  var user = make('user', 'with_projects'); // create a user with projects in the store
  visit('/user/1');

  andThen(function () {
    var newProjectName = "Gonzo Project";

    fillIn('input.project-name', newProjectName);

    // Remember, this is for handling an exact match, if you did not care about
    // matching attributes, you could just do: viewHelper.handleCreate('project')
    TestHelper.handleCreate('project', {match: {name: newProjectName, user: user}});

    /**
     Let's say that clicking this 'button.add-project', triggers action in the view to
     create project record and looks something like this:

     actions: {
            addProject: function (user) {
              var name = this.$('input.project-name').val();
              var store = this.get('controller.store');
              store.createRecord('project', {name: name, user: user}).save();
            }

      */
    click('button:contains(Add New User)');

    andThen(function () {
      var newProjectDiv = find('li.project:contains(' + newProjectName + ')');
      ok(newProjectDiv[0] !== undefined);
    });
  });
});
