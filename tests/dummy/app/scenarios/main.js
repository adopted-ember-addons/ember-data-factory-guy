import {Scenario} from 'ember-data-factory-guy';

import Users from './users';
import UsersB from './usersB';

Scenario.settings({
  mockjaxLogLevel: 1,
  logLevel: 1,
});

export default class extends Scenario {
  run() {
    this.include([Users]);
//    this.include([UsersB]);
  }
}