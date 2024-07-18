import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class SearchController extends Controller {
  @service router;
  @tracked userName;

  @action
  onUserSearch(name) {
    this.router.transitionTo('search.results', name);
  }

  @action
  onSetUserName(event) {
    this.userName = event.target.value;
  }
}
