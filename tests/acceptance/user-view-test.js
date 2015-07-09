import Ember from 'ember';
import { make } from 'ember-data-factory-guy';
import TestHelper from 'ember-data-factory-guy/factory-guy-test-helper';
import startApp from '../helpers/start-app';

var App;

module('User View', {
  beforeEach: function () {
    App = startApp();
    // TestHelper.setup sets $.mockjaxSettings response time to zero ( speeds up tests )
    TestHelper.setup();
  },
  afterEach: function () {
    Ember.run(function () {
      // TestHelper.teardown calls $.mockjax.clear() which resets all the mockjax handlers
      TestHelper.teardown();
      // destroy blows away the application and the store ( and the models you've made )
      App.destroy();
    });
  }
});


test("Creates new project", function () {
  // create a user with projects ( which will be in the store )
  var user = make('user', 'with_projects');

  visit('/user/' + user.id);

  var newProjectTitle = "Gonzo Project";

  andThen(function () {
    fillIn('input.project-title', newProjectTitle);

    // Remember, this is for handling an exact match, if you did not care about
    // matching attributes, you could just do: TestHelper.handleCreate('project')
    TestHelper.handleCreate('project').match({title: newProjectTitle, user: user});

    /**
     Let's say that clicking this 'button:contains(Add New User)', triggers action in the
     view to create project record and looks something like this:

     actions: {
       addProject: function (user) {
         var title = this.$('input.project-title').val();
         var store = this.get('controller.store');
         store.createRecord('project', {title: title, user: user}).save();
       }
     }

    */
    click('button:contains(Add New User)');

    andThen(function () {
      var newProjectDiv = find('li.project:contains(' + newProjectTitle + ')');
      ok(newProjectDiv[0] !== undefined);
    });
  });
});