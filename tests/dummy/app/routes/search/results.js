import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.store.query('user', { name: params.name }).catch((e) => e);
  },

  setupController(controller, users) {
    let { meta = {} } = users;
    controller.set('model', users);
    controller.set('previousPage', meta.previous);
    controller.set('nextPage', meta.next);
  },
});
