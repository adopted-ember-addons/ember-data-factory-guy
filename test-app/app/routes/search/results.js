import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { waitForPromise } from '@ember/test-waiters';

export default class extends Route {
  @service store;

  model(params) {
    return waitForPromise(
      this.store.query('user', { name: params.name }).catch((e) => e)
    );
  }
}
