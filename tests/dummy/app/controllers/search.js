import Ember from 'ember';

export default Ember.Controller.extend({

  actions: {
    userSearch(name) {
      this.transitionToRoute('search.results', name);
    }
  }
});
