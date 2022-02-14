import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class SearchController extends Controller {
  @service router;
  @action
  userSearch(name) {
    this.router.transitionTo('search.results', name);
  }
}
