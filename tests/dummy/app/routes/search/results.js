import Route from '@ember/routing/route';

export default class extends Route {
  model(params) {
    return this.store.query('user', { name: params.name }).catch((e) => e);
  }
}
