import Ember from 'ember';
import { make, clearStore } from 'ember-data-factory-guy';
import User from 'dummy/models/user';
//import { moduleFor, moduleForModel } from 'ember-qunit';

moduleForModel('user', 'User');

test('it has projects', function() {
  //var user = make('user' , 'with_projects');
  console.log(this.store+'');
});

