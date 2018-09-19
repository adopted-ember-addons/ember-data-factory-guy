import { module, test } from 'qunit';
import {
  build,
  buildList,
  make,
  mockFindRecord,
  setupFactoryGuy
} from 'ember-data-factory-guy';
import { setupApplicationTest } from "ember-qunit";
import { visit } from '@ember/test-helpers';

module('Acceptance | Employee View ( model-fragments )', function(hooks) {
  setupApplicationTest(hooks);
  setupFactoryGuy(hooks);

  test("Show employee by make(ing) a model ( with hasMany fragment added manually ) and using returns with that model", async function(assert) {
    let departmentEmployments = buildList('department-employment', 2).get();
    let employee = make('employee', {departmentEmployments});

    mockFindRecord('employee').returns({model: employee});
    await visit('/employee/' + employee.get('id'));

    assert.dom('.name').containsText(`${employee.get('name.firstName')} ${employee.get('name.lastName')}`);
    assert.dom('.department-employment').exists({count: 2}, "fragment array works");
  });

  test("Show employee by make(ing) a model ( with belongsTo fragment added manually ) and using returns with that model", async function(assert) {
    let name = make('name', {firstName: 'Joe', lastName: 'Black'});
    let employee = make('employee', {name});

    mockFindRecord('employee').returns({model: employee});
    await visit('/employee/' + employee.get('id'));

    assert.dom('.name').containsText(`${employee.get('name.firstName')} ${employee.get('name.lastName')}`);
  });

  test("Show employee by make(ing) a model and using returns with that model", async function(assert) {
    let employee = make('employee', 'with_department_employments');

    mockFindRecord('employee').returns({model: employee});
    await visit('/employee/' + employee.get('id'));

    assert.dom('.name').containsText(`${employee.get('name.firstName')} ${employee.get('name.lastName')}`);
    assert.dom('.department-employment').exists({count: 2}, "fragment array works");
  });

  test("Show employee by build(ing) json and using returns with that json", async function(assert) {
    let employee = build('employee', 'with_department_employments');

    mockFindRecord('employee').returns({json: employee});
    await visit('/employee/' + employee.get('id'));

    assert.dom('.name').containsText(`${employee.get('name').first_name} ${employee.get('name').last_name}`);
    assert.dom('.department-employment').exists({count: 2}, "fragment array works");
  });

  test("Show employee by build(ing) json ( with hasMany fragment added manually ) and using returns with that json", async function(assert) {
    let departmentEmployments = buildList('department-employment', 2).get();
    let employee = build('employee', {departmentEmployments});

    mockFindRecord('employee').returns({json: employee});
    await visit('/employee/' + employee.get('id'));

    assert.dom('.name').containsText(`${employee.get('name').first_name} ${employee.get('name').last_name}`);
    assert.dom('.department-employment').exists({count: 2}, "fragment array works");
  });
});
