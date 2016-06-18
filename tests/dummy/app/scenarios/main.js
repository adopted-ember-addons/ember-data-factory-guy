import {Scenario} from 'ember-data-factory-guy';

import Users from './users';
import UsersB from './usersB';

Scenario.setupOptions({
  logger: null,
  logLevel: 0,
//  fgDebug: 4
});

export default class extends Scenario {
  run() {
    this.include([Users]);
//    this.include([UsersB]);
  }
}