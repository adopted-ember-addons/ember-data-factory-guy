import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
export default Controller.extend({
  store: service(),
  actions: {
    createProject(user, title) {
      return this.store
        .createRecord('project', { title: title, user: user })
        .save();
    },
  },
});
