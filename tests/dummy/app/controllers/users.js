import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    deleteUser(user) {
      return user.destroyRecord();
    },
  },
});
