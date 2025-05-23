import EmberRouter from '@ember/routing/router';
import config from 'test-app/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('users');
  this.route('profiles');
  this.route('cats');
  this.route('user', { path: '/user/:user_id' });
  this.route('search', function () {
    this.route('results', { path: ':name' });
  });
});
