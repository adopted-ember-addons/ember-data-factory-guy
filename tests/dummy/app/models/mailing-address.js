import { attr } from '@ember-data/model';
import Address from 'dummy/models/nested-fragment/address';

export default Address.extend({
  mailingAddressProperty: attr('number'),
});
