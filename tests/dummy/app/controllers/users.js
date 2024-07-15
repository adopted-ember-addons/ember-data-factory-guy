import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class extends Controller {
  @tracked users;

  @action
  deleteUser(user) {
    return user.destroyRecord();
  }
}
