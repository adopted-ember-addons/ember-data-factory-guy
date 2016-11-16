import Model from 'ember-data/model';
import attr from 'ember-data/attr';

export default Model.extend({
  name: attr('string'),
  derivedName: undefined,
  didLoad() {
    this._super();
    this.set('derivedName', `${this.get('name')} -set in model#didLoad-`);
  }
});
