import { make, makeList, build, buildList, mockQuery } from 'ember-data-factory-guy';
import moduleForAcceptance from '../helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | User Search');

var search = function(name) {
  andThen(()=> {
    fillIn('input.user-name', name);
    click('button.find-user');
  });
};

var visitAndSearch = function(name) {
  visit('/search');
  search(name);
};

test("mockQuery without params matches store.query with any parameters", function () {
  let dude = buildList('user', {name: 'Dude'});

  // no query parameters set in the mock so it will match
  // a query for {name: "Bif"} and return the dude
  mockQuery('user').returns({json: dude});

  visitAndSearch("Bif"); // still returns dude

  andThen(()=> {
    ok(find('.user .name').length === 1);
    ok(find('.user .name').text().match("Dude"));
  });

});


test("mockQuery with params matches store.query with those parameters", function () {
  let dude = buildList('user', {name: 'Dude'});

  // asking to mock only exact match of 'user'
  // with these parameters: {name: "Dude"}
  mockQuery('user', {name: "Dude"}).returns({json: dude});

  visitAndSearch("Dude");

  andThen(()=> {
    ok(find('.user .name').length === 1);
    ok(find('.user .name').text().match("Dude"));
  });

});

test("reusing mockQuery to return different results with different parameters", function () {
  let sillyPeople = buildList('user', {name: 'Bo'}, {name: "Bif"});

  // nothing is returned with these parameters: {name: "Dude"}
  let mock = mockQuery('user', {name: "Dude"});

  visitAndSearch("Dude");

  andThen(()=> {
    ok(find('.user .name').length === 0);
  });

  andThen(()=>{
    mock.withParams({name: "silly"}).returns({json: sillyPeople});
    search("silly");
  });

  andThen(()=>{
    ok(find('.user .name').length === 2);
    ok(find('.user .name:first').text().match("Bo"));
    ok(find('.user .name:last').text().match("Bif"));
  });

});


test("using returns( models )", function () {
  let bobs = makeList("bob", 2);

  mockQuery('user', {name: "bob"}).returns({models: bobs});

  visitAndSearch("bob");

  andThen(()=> {
    ok(find('.user').length === 2);
  });

});

test("using returns( ids )", function () {
  let bob = make("bob");
  let user = make("user");

  mockQuery('user').returns({ids:[bob.id]});

  visitAndSearch("user2");

  andThen(()=> {
    ok(find('.user').length === 1);
    ok(find('.user .name').text().match("Bob"));
  });

});


test("using fails to mock a failed query", function () {
  let errors = {errors: {description: ['invalid']}};
  mockQuery('user').fails({status: 422, response: errors});

  visitAndSearch("Allen");

  andThen(()=> {
    ok(find('.results').text().match('Errors'));
  });
});
