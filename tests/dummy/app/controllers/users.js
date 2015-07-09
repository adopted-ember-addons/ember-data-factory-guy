import Ember from 'ember';
export default Ember.Controller.extend({
  userNames: function() {
    return this.get('model').mapBy('name');
  },

  actions: {
    changeName: function(user, newName) {
      user.set('name', newName).save();
    }
  }
});