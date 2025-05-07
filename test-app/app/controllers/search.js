import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class SearchController extends Controller {
  @service router;

  @tracked userName = '';

  userSearch = () => {
    this.router.transitionTo('search.results', this.userName);
  };

  setUserName = (event) => {
    this.userName = event.target.value;
  };
}
