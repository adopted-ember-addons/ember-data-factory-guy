import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service('store'),
  classNames: ['user'],

  actions: {
    addProject: function (user) {
      let title = this.$('input.project-title').val();
      let store = this.get('controller.store');
      this.get('store').createRecord('project', {title: title, user: user}).save().then((record) => {
        console.log('Project record ID returned in App code:', record.get('id'));
        record.reload();
      });
    }
  }
});