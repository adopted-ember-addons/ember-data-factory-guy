import attr from 'ember-data/attr';
import Address from 'dummy/models/nested-fragment/address';

export default Address.extend({
  mailingAddressProperty: attr('number')
});
