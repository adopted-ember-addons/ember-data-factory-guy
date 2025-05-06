import { attr } from '@ember-data/model';
import Address from 'test-app/models/nested-fragment/address';

export default class extends Address {
  @attr('number') billingAddressProperty;
}
