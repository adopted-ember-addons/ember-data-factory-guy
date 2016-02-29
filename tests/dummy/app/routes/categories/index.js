import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    remove: function(model) {
      if(window.confirm('Are you sure?')) {
        model.destroyRecord();
      }
    }
  },
  model: function() {
    return this.store.query('category',{});
    //return this.store.findAll('category',{}); // Using this causes the test to pass if the test also uses 'handleFindAll'
  }
});
