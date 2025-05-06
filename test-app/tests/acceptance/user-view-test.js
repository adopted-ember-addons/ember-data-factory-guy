import { module, test } from 'qunit';
import {
  make,
  makeList,
  build,
  buildList,
  setupFactoryGuy,
  mockFindRecord,
  mockCreate,
} from 'ember-data-factory-guy';
import { setupApplicationTest } from 'ember-qunit';
import { visit, fillIn, click } from '@ember/test-helpers';

// NOTE
// New ember-qunit and qunit-dom style of testing
module('Acceptance | User View', function (hooks) {
  setupApplicationTest(hooks);
  setupFactoryGuy(hooks);

  test('Show user by make(ing) a model and using returns with that model', async function (assert) {
    // if you need to test computed properties on projects or users this is best bet
    // => make a user with projects ( which will be in the store )
    let [project1, project2] = makeList('project', 2),
      user = make('user', { projects: [project1, project2] }),
      // => the store.findRecord will now 'return' the very user you just created, voila!
      mock = mockFindRecord('user').returns({ model: user });

    await visit('/user/' + mock.get('id'));

    assert.dom('.name').containsText(user.get('name'));
    // the power of making a model instead of json is that you can access
    // computed properties on the model to use in your tests
    assert.dom('.funny-name').containsText(user.get('funnyName'));

    assert.dom('li.project:first-child').containsText(project1.get('title'));
    assert.dom('li.project:last-child').containsText(project2.get('title'));
  });

  test('Show user with projects by build(ing) json and using returns with json', async function (assert) {
    // build a user with projects ( which will be sideloaded into the payload, and
    // therefore be put in the store when user is loaded )
    let projects = buildList('project', { title: 'Moo' }, { title: 'Zoo' }),
      user = build('user', { projects: projects }),
      mock = mockFindRecord('user').returns({ json: user });

    await visit('/user/' + mock.get('id'));

    // can't test the funny name computed property ( so easily )
    // as you could when using models because you only have json
    assert.dom('.name').containsText(user.get('name'));

    assert.dom('li.project:first-child').containsText(projects.get(0).title);
    assert.dom('li.project:last-child').containsText(projects.get(1).title);
  });

  test('Add a project to a user with mockCreate', async function (assert) {
    // mockFindRecord will build a default user for the json payload
    let mock = mockFindRecord('user');

    await visit('/user/' + mock.get('id'));

    let newProjectTitle = 'Gonzo Project';

    // should be no projects
    assert.dom('li.project').doesNotExist('No projects shown');

    await fillIn('input.project-title', newProjectTitle);

    // Remember, this is for handling an exact match, if you did not care about
    // matching attributes, you could just do: mockCreate('project')
    mockCreate('project').match({ title: newProjectTitle });

    /**
     Let's say that clicking this a button, triggers action in the
     view to create project record and looks something like this:

     actions: {
       addProject: function (user) {
         let title = this.$('input.project-title').val();
         let store = this.get('store');
         store.createRecord('project', {title, user}).save();
       }
     }

     */
    await click('button.add-project');

    assert.dom('li.project').exists('One project shown');
  });

  test('Add a project to a user with mockCreate and a custom matching function', async function (assert) {
    // mockFindRecord will build a default user for the json payload
    let mock = mockFindRecord('user');

    await visit('/user/' + mock.get('id'));

    let newProjectTitle = 'Gonzo Project';

    // should be no projects
    assert.dom('li.project').doesNotExist('No projects shown');

    await fillIn('input.project-title', newProjectTitle);

    // You can also implement your own custom matching function
    mockCreate('project').match((requestBody) => {
      return requestBody.data.attributes.title === newProjectTitle;
    });

    /**
     Let's say that clicking this a button, triggers action in the
     view to create project record and looks something like this:

     actions: {
       addProject: function (user) {
         let title = this.$('input.project-title').val();
         let store = this.get('store');
         store.createRecord('project', {title, user}).save();
       }
     }

     */
    await click('button.add-project');

    assert.dom('li.project').exists('One project shown');
  });

  test('Request failure shows a error message', async function (assert) {
    let mock = mockFindRecord('user').fails({ status: 404 });
    await visit('/user/' + mock.get('id'));

    assert.dom('.error').hasText('User not found');
  });
});
