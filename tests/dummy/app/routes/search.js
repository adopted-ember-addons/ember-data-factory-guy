import Ember from 'ember';

export default Ember.Route.extend({

  actions: {

    findUsers(name) {
      this.transitionTo('search.results', name);
    }
  }
});
