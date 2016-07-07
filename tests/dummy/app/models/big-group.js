import Group from './group';
import attr from 'ember-data/attr';

export default Group.extend({
  type: attr('string', { defaultValue: 'BigGroup' })
});
