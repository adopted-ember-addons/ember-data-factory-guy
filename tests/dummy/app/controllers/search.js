import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    userSearch(name) {
      this.transitionToRoute('search.results', name);
    },
  },
});
