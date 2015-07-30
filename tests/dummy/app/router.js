import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('users');
  this.route('profiles');
  this.route('user', {path: '/user/:user_id'});
});

export default Router;
