import Component from '@ember/component';

export default Component.extend({
  actions: {
    findUsers(userName) {
      this.userSearch(userName);
    },
  },
});
