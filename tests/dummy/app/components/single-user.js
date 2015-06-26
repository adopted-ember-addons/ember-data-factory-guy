import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service('store'),
  actions: {
    addProject: function (user) {
      var title = this.$('input.project-title').val();
      var store = this.get('controller.store');
      this.get('store').createRecord('project', {title: title, user: user}).save();
    }
  }
});