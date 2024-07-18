import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
export default class UserController extends Controller {
  @service store;
  @tracked projectTitle;

  @action
  onSetProjectTitle(event) {
    this.projectTitle = event.target.value;
  }

  @action
  createProject(user, title) {
    return this.store
      .createRecord('project', { title: title, user: user })
      .save();
  }
}
