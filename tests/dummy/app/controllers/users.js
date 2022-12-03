import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class extends Controller {
  @action
  deleteUser(user) {
    return user.destroyRecord();
  }
}
