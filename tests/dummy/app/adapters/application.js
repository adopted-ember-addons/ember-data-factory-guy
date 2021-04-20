import AdapterFetch from 'ember-fetch/mixins/adapter-fetch';
import JSONAPIAdapter from '@ember-data/adapter/json-api';

export default JSONAPIAdapter.extend(AdapterFetch);
