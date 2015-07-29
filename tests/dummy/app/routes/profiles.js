import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var promise = this.store.findAll('profile');
    promise.then(function(profiles) {
        console.log('in router', profiles, profiles.get('content'));
      });
    return promise;
  }
});
