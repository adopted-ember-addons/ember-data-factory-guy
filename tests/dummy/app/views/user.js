import Ember from 'ember';

export default Ember.View.extend({
  actions: {
    addProject: function (user) {
      var name = this.$('input.project-name').val();
      var store = this.get('controller.store');
      store.createRecord('project', {name: name, user: user}).save();
    }
  }
});
