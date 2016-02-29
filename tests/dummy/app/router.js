import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('users');
  this.route('profiles');
  this.route('user', {path: '/user/:user_id'});

  this.route("categories", function() {
    this.route("new");

    this.route("edit", {
      path: ":category_id/edit"
    });

    this.route("show", {
      path: ":category_id"
    });
  });
});

export default Router;
