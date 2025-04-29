import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class extends Route {
  @service store;

  model(params) {
    return this.store.findRecord('user', params.user_id).catch(() => null);
  }
}
