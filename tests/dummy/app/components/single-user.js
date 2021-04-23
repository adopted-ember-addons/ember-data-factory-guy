import Component from '@ember/component';

export default Component.extend({
  classNames: ['user'],

  actions: {
    addProject: function (user, title) {
      this.createProject(user, title);
    },
  },
});
