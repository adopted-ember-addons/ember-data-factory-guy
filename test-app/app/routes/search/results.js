import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class extends Route {
  @service store;

  model(params) {
    return this.store.query('user', { name: params.name }).catch((e) => e);
  }
}
