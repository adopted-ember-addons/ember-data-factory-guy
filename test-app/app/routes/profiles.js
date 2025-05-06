import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { waitForPromise } from '@ember/test-waiters';

export default class extends Route {
  @service store;

  model() {
    return waitForPromise(this.store.findAll('profile'));
  }
}
