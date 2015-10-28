import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
import FactoryGuy from 'ember-data-factory-guy';
import TestHelper from 'ember-data-factory-guy/factory-guy-test-helper';

var application;
var originalConfirm;
var confirmCalledWith;


module('Acceptance: Category Scaffolding', {
  beforeEach: function() {
    application = startApp();
    originalConfirm = window.confirm;
    window.confirm = function() {
      confirmCalledWith = [].slice.call(arguments);
      return true;
    };
    TestHelper.setup();
  },
  afterEach: function() {
    TestHelper.teardown();
    Ember.run(application, 'destroy');
    window.confirm = originalConfirm;
    confirmCalledWith = null;
  }
});

test('visiting /categories without data', function(assert) {
  TestHelper.handleFindAll('category', 0);
  visit('/categories');

  andThen(function() {
    assert.equal(currentPath(), 'categories.index');
    assert.equal(find('.empty-block-msg').text().trim(), 'No categories are found');
  });
});

test('visiting /categories with data', function(assert) {
  TestHelper.handleFindAll('category', 1);
  visit('/categories');

  andThen(function() {
    assert.equal(currentPath(), 'categories.index');
    assert.equal(find('.empty-block').length, 0);
    assert.equal(find('table tbody tr').length, 1);
  });
});

test('create a new category', function(assert) {
  TestHelper.handleQuery('category', {}, []);
  //TestHelper.handleFindAll('category', 0); // This works if the route is changed to use findAll
  visit('/categories');

  andThen(function() {
    assert.equal(find('.empty-block').length, 1);
    assert.equal(find('table tbody tr').length, 0);
  });

  click('a:contains(New Category)');

  andThen(function() {
    assert.equal(currentPath(), 'categories.new');

    fillIn('div:contains(Name) input', 'MyString');
    fillIn('div:contains(Description) input', 'MyString');

    TestHelper.handleCreate('category');

    click('button:submit');
  });

  andThen(function() {
    assert.equal(currentPath(), 'categories.index');
    //TODO : Figure out why ember-data-factory-guy doesn't see the new model
    // https://github.com/danielspaniel/ember-data-factory-guy/issues/143
    assert.equal(find('.empty-block').length, 0);
    assert.equal(find('table tbody tr').length, 1);
  });
});

test('update an existing category', function(assert) {
  var category = FactoryGuy.make('category');
  TestHelper.handleQuery('category', {}, [category]);
  
  visit('/categories');
  click('.category-list-item-edit-btn');

  andThen(function() {
    assert.equal(currentPath(), 'categories.edit');

    fillIn('div:contains(Name) input', 'MyString');
    fillIn('div:contains(Description) input', 'MyString');

    TestHelper.handleUpdate(category, {match: {name: 'MyNewString'}});
    click('button:submit');
  });

  andThen(function() {
    assert.equal(find('.empty-block').length, 0);
    assert.equal(find('table tbody tr').length, 1);
  });
});

// [DEPRECATED] Commenting out since we don't need to show the category on a separate page
// TODO: Remove probably?

// test('show an existing category', function(assert) {
//   TestHelper.handleFindAll('category', 1);
//   TestHelper.handleFindAll('product', 1);
//   visit('/categories');
//   click('.page-content-pane-main a:contains(Webinar)');

//   andThen(function() {
//     assert.equal(currentPath(), 'categories.show');

//     assert.equal(find('h1.category-name').text(), 'Webinar');
//   });
// });

test('delete a category', function(assert) {
  var category = FactoryGuy.make('category');
  TestHelper.handleQuery('category', {}, [category]);

  visit('/categories');

  TestHelper.handleDelete('category',category.id);
  click('.category-list-item-delete-btn');

  andThen(function() {
    assert.equal(currentPath(), 'categories.index');
    assert.deepEqual(confirmCalledWith, ['Are you sure?']);
    assert.equal(find('.empty-block').length, 1);
  });
});

