import Route from '@ember/routing/route';
import { waitForPromise } from '@ember/test-waiters';

export default class extends Route {
  model() {
    // reload: true to ensure we have a promise to wait on before rendering page
    return waitForPromise(this.store.findAll('user', { reload: true }));
  }
}
