import {test} from 'qunit';
import FactoryGuy, {make, build, buildList, mockFindRecord} from 'ember-data-factory-guy';
import moduleForAcceptance from '../helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | Employee View ( model-fragments )');
// NOTE
// FactoryGuy before and after setup is in moduleForAcceptance helper

test("Show employee by make(ing) a model ( with hasMany fragment added manually ) and using returns with that model", async function(assert) {
  let departmentEmployments = buildList('department-employment', 2).get();
  let employee = make('employee', { departmentEmployments });

  mockFindRecord('employee').returns({ model: employee });
  await visit('/employee/' + employee.get('id'));
//  console.log("employee.get('name')",employee.get('name').toJSON());
  assert.ok(find('.name').text().match(`${employee.get('name.firstName')} ${employee.get('name.lastName')}`));
//  assert.ok(find('.name').text().match(`${employee.get('name.firstName')} ${employee.get('name.lastName')}`));
  assert.equal(find('.department-employment').length, 2, "fragment array works");
});

test("Show employee by make(ing) a model and using returns with that model", async function(assert) {
  let employee = make('employee', 'with_department_employments');

  mockFindRecord('employee').returns({ model: employee });
  await visit('/employee/' + employee.get('id'));

  assert.ok(find('.name').text().match(`${employee.get('name.firstName')} ${employee.get('name.lastName')}`));
  assert.equal(find('.department-employment').length, 2, "fragment array works");
});

//test("Show employee by make(ing) a model ( with belongsTo fragment added manually ) and using returns with that model", async function(assert) {
//   let name = build('name', { firstName: 'Joe', lastName: 'Black' }).get();
//   let employee = make('employee', { name });
//
//   mockFindRecord('employee').returns({ model: employee });
//   await visit('/employee/' + employee.get('id'));
//
//   assert.ok(find('.name').text().match(`${employee.get('name.firstName')} ${employee.get('name.lastName')}`));
// });

test("Show employee by make(ing) a model ( with belongsTo fragment added manually ) and using returns with that model", async function(assert) {
  FactoryGuy.settings({logLevel: 1});
  let firstName = 'Joe',
      lastName  = 'Black',
//      name      = build('name', {first_name: firstName, last_name: lastName}).get(),
      name      = build('name', {firstName, lastName}).get(),
      employee  = build('employee', {name});
//      employee  = build('employee', {name:{first_name: firstName, last_name: lastName}});
//      employee  = make('employee', {name:{firstName, lastName}});

//  let profile = make('profile');
//  console.log('camelCaseDescription',profile.get('camelCaseDescription'));
//  console.log('name',name);
//  console.log('employee.get(\'name\')',Em.run(()=>employee.get('name')));
//  console.log('employee', JSON.stringify(employee));
//  let json = {"data":{"type":"employee","attributes":{"name":{"first_name":"Joe","last_name":"Black"},"titles":["Mr.","Dr."],"gender":"Male","birth-date":"2016-05-01T00:00:00.000Z"},"id":1}}
  mockFindRecord('employee').returns({json: employee});
//  mockFindRecord('employee').returns({model: employee});
//console.log('employee', Em.run(()=>JSON.stringify(employee)));
  await visit('/employee/' + employee.get('id'));
//  console.log('test','text:',find('.name').text(), '     name:',employee.get('name'),employee.get('name.lastName'));
//  assert.ok(find('.name').text().match(`${employee.get('name.firstName')} ${employee.get('name.lastName')}`));
//  let firstName = 'Joe',
//      lastName  = 'Black',
//      name      = build('name', {firstName, lastName}).get(),
//      employee  = build('employee', {name});
//
//  mockFindRecord('employee').returns({json: employee});
//  await visit('/employee/' + employee.get('id'));
//
  assert.ok(find('.name').text().match(`${firstName} ${lastName}`));
});

test("Show employee by building(ing) json and using returns with that json", async function(assert) {
  // 'with_department_employments' is a trait that build the has many in the employee factory 
  let employee = build('employee', 'with_department_employments');
  FactoryGuy.settings({logLevel: 1});
  mockFindRecord('employee').returns({ json: employee });

  await visit('/employee/' + employee.get('id'));

  console.log("find('.name').text()",find('.name').text());
  console.log("employee.get('name')",employee.get('name'));
  assert.ok(find('.name').text().match(`${employee.get('name').firstName} ${employee.get('name').lastName}`));
  assert.equal(find('.department-employment').length, 2, "fragment array works");
});

//test("Show employee by building(ing) json ( with hasMany fragment added manually ) and using returns with that json", async function(assert) {
//  let firstName = 'Joe',
//      lastName  = 'Black',
//      name      = build('name', {firstName, lastName}).get();
//
//  let departmentEmployments = buildList('department-employment', 2).get();
//  let employee = build('employee', { departmentEmployments, name });
//
//  mockFindRecord('employee').returns({ json: employee });
//  await visit('/employee/' + employee.get('id'));
//  console.log('test','text',find('.name').text(), 'name',employee.get('name.firstName'));
//  assert.ok(find('.name').text().match(`${employee.get('name').firstName} ${employee.get('name').lastName}`));
//  assert.equal(find('.department-employment').length, 2, "fragment array works");
//});
