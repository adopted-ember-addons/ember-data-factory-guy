import DS from 'ember-data';
import AdapterFetch from 'ember-fetch/mixins/adapter-fetch';

//export default DS.JSONAPIAdapter.extend();
export default DS.JSONAPIAdapter.extend(AdapterFetch);
//export default DS.RESTAdapter.extend(AdapterFetch);
