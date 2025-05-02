import Controller from '@ember/controller';
import { action } from '@ember/object';
import { waitForPromise } from '@ember/test-waiters';

export default class extends Controller {
  @action
  deleteUser(user) {
    waitForPromise(user.destroyRecord());
  }
}
