import {module, test} from 'qunit';
import { make, build, buildList, mockFindRecord, mockCreate } from 'ember-data-factory-guy';
import moduleForAcceptance from '../helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | User View');
// NOTE
// FactoryGuy before and after setup is in moduleForAcceptance helper

test("Show user by make(ing) a model and using returns with that model", function(assert) {
  // make a user with projects ( which will be in the store )
  // if you need the computed properties on the model this is best bet
  let user = make('user', 'with_projects');
  let projects = user.get('projects');
  mockFindRecord('user').returns({model: user});

  visit('/user/' + user.get('id'));

  andThen(()=>{
    assert.ok(find('.name').text().match(user.get('name')));
    // the power of making a model instead of json is that you can access
    // computed properties on the model to use in your tests
    assert.ok(find('.funny-name').text().match(user.get('funnyName')));
    assert.ok(find('li.project:first').text().match(projects.get('firstObject.title')));
    assert.ok(find('li.project:last').text().match(projects.get('lastObject.title')));
  });
});

test("Show user with projects by build(ing) json and using returns with json", function(assert) {
  // build a user with projects ( which will be sideloaded into the payload, and
  // therefore be put in the store when user is loaded )
  let projects = buildList('project', {title: 'Moo'}, {title: 'Zoo'});
  let user = build('user', {projects: projects});
  mockFindRecord('user').returns({json: user});

  visit('/user/' + user.get('id'));

  andThen(()=>{
    assert.ok(find('.name').text().match(user.get('name')));
    // can't test the funny name computed property ( so easily )
    // as you could when using models because you only have json
    assert.ok(find('li.project:first').text().match(projects.get(0).title));
    assert.ok(find('li.project:last').text().match(projects.get(1).title));
  });
});

test("Add a project to a user with mockCreate", function(assert) {
  // mockFindRecord will build a default user for the json payload
  let mock = mockFindRecord('user');

  visit('/user/' + mock.get('id'));

  let newProjectTitle = "Gonzo Project";

  andThen(()=> {
    // should be no projects
    assert.equal(find('li.project').length, 0);

    fillIn('input.project-title', newProjectTitle);

    // Remember, this is for handling an exact match, if you did not care about
    // matching attributes, you could just do: mockCreate('project')
    mockCreate('project').match({title: newProjectTitle});

    /**
     Let's say that clicking this 'button:contains(Add New User)', triggers action in the
     view to create project record and looks something like this:

     actions: {
       addProject: function (user) {
         let title = this.$('input.project-title').val();
         let store = this.get('controller.store');
         store.createRecord('project', {title: title, user: user}).save();
       }
     }

    */
    click('button:contains(Add New User)');

    andThen(()=> {
      let newProjectDiv = find('li.project:contains(' + newProjectTitle + ')');
      assert.ok(newProjectDiv[0]);
    });
  });
});