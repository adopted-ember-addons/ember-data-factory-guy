import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class extends Controller {
  get previousPage() {
    return this.model.meta?.previous;
  }

  get nextPage() {
    return this.model.meta?.next;
  }

  @action
  noop() {}
}
