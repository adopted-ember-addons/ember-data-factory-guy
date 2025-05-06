import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { waitForPromise } from '@ember/test-waiters';

export default class extends Route {
  @service store;

  model() {
    // reload: true to ensure we have a promise to wait on before rendering page
    return waitForPromise(this.store.findAll('profile', { reload: true }));
  }
}
