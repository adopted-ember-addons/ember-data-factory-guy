import Controller from '@ember/controller';
export default Controller.extend({

  actions: {
    createProject(user, title) {
      return this.get('store').createRecord('project', { title: title, user: user }).save();
    }
  }
});
