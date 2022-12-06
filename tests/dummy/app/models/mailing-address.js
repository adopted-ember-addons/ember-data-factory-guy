import { attr } from '@ember-data/model';
import Address from 'dummy/models/nested-fragment/address';

export default class extends Address {
  @attr('number') mailingAddressProperty;
}
