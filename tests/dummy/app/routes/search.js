import Ember from 'ember';
import { make } from 'ember-data-factory-guy';

export default Ember.Route.extend({

  actions: {

    findUsers(name) {
      this.transitionTo('search.results', name);
    }
  }
});
