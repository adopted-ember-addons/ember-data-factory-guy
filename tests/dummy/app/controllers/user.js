import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
export default class UserController extends Controller {
  @service store;
  @action
  createProject(user, title) {
    return this.store
      .createRecord('project', { title: title, user: user })
      .save();
  }
}
