import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('users');
  this.route('profiles');
  this.route('employees');
  this.route('employee', {path: '/employee/:employee_id'});
  this.route('user', {path: '/user/:user_id'});
  this.route('search', {path: '/search'}, function() {
    this.route('results', {path: ':name'});
  });
});

export default Router;
