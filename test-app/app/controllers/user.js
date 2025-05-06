import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { waitForPromise } from '@ember/test-waiters';

export default class UserController extends Controller {
  @service store;
  @action
  createProject(user, title) {
    return waitForPromise(
      this.store.createRecord('project', { title: title, user: user }).save()
    );
  }
}
