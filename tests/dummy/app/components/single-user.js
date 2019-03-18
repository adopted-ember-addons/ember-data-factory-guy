import Component from '@ember/component';

export default Component.extend({
  classNames: ['user'],

  actions: {
    
    addProject: function (user, title) {
      this.get('createProject')(user, title);
    }
  }
});
