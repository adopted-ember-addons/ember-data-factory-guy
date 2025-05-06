import Controller from '@ember/controller';

export default class extends Controller {
  get previousPage() {
    return this.model.meta?.previous;
  }

  get nextPage() {
    return this.model.meta?.next;
  }
}
