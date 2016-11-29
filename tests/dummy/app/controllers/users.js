import Ember from 'ember';

export default Ember.Controller.extend({

  actions: {
    deleteUser(user) {
      return user.destroyRecord();
    }
  }
});
