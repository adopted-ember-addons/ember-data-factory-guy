import Ember from 'ember';

export default Ember.View.extend({
  actions: {
    addProject: function (user) {
      var title = this.$('input.project-title').val();
      var store = this.get('controller.store');
      store.createRecord('project', {title: title, user: user}).save().then(function(project){
        console.log('created project', project+'', project.get('user.projects.length')+'')
      });
    }
  }
});
