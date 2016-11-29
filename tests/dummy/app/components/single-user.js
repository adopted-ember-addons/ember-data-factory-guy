import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['user'],

  actions: {
    
    addProject: function (user) {
      let title = this.$('input.project-title').val();
      this.get('createProject')(user, title);
    }
  }
});