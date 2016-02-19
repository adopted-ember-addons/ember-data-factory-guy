import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service('store'),

  actions: {
    addProject: function (user) {
      let title = this.$('input.project-title').val();
      let store = this.get('controller.store');
      this.get('store').createRecord('project', {title: title, user: user}).save();
    }
  }
});