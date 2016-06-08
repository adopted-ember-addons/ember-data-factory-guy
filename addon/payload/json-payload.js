import Ember from 'ember';
import BasePayload from './base-payload';

export default class extends BasePayload {

  /** 
   Can't add to included array for JSON payloads since they have
   no includes or sideloaded relationships

   Meta not working at the moment for this serializer even though
   it is being included here in the payload
   */
  add(more) {
    if (more.meta) {
      this.addMeta(more.meta);
    }
    return this.json;
  }

  getObjectKeys(key) {
    let attrs = this.json;
    if (Ember.isEmpty(key)) {
      return JSON.parse(JSON.stringify(attrs));
    }
    return attrs[key];
  }

  getListKeys(key) {
    let attrs = this.json;
    if (Ember.isEmpty(key)) {
      return JSON.parse(JSON.stringify(attrs));
    }
    if (typeof key === 'number') {
      return attrs[key];
    }
    if (key === 'firstObject') {
      return attrs[0];
    }
    if (key === 'lastObject') {
      return attrs[attrs.length - 1];
    }
  }

}