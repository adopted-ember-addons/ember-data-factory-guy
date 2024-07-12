import { isEmpty } from '@ember/utils';
import JSONPayload from './json-payload';

export default class extends JSONPayload {
  // only add the meta data if there is query ( results key is present )
  addMeta(data) {
    if (this.json.results) {
      Object.assign(this.json, data);
    }
  }

  getListKeys(key) {
    let attrs = this.json.results;
    if (isEmpty(key)) {
      return JSON.parse(JSON.stringify(attrs));
    }
    if (typeof key === 'number') {
      return attrs[key];
    }
  }
}
