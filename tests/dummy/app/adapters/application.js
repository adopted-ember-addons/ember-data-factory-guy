// TODO: Remove the need for this mixin
// eslint-disable-next-line ember/no-mixins
import AdapterFetch from 'ember-fetch/mixins/adapter-fetch';
import JSONAPIAdapter from '@ember-data/adapter/json-api';

export default class extends JSONAPIAdapter.extend(AdapterFetch) {}
