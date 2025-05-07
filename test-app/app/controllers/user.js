import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { waitForPromise } from '@ember/test-waiters';

export default class UserController extends Controller {
  @service store;

  @tracked projectTitle = '';

  createProject = (user, title) => {
    return waitForPromise(
      this.store.createRecord('project', { title: title, user: user }).save(),
    );
  };

  setProjectTitle = (event) => {
    this.projectTitle = event.target.value;
  };
}
