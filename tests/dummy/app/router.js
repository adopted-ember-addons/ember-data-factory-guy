import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('users');
  this.route('profiles');
  this.route('employees');
  this.route('cats');
  this.route('employee', {path: '/employee/:employee_id'});
  this.route('user', {path: '/user/:user_id'});
  this.route('search', {path: '/search'}, function() {
    this.route('results', {path: ':name'});
  });
});

export default Router;
