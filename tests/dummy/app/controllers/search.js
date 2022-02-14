import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  router: service(),
  actions: {
    userSearch(name) {
      this.router.transitionTo('search.results', name);
    },
  },
});
