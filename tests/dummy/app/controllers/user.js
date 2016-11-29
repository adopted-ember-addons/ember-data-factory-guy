import Ember from 'ember';
export default Ember.Controller.extend({

  actions: {
    createProject(user, title) {
      return this.get('store').createRecord('project', { title: title, user: user }).save();
    }
  }
});
