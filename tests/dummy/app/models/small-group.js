import Group from './group';
import { attr } from '@ember-data/model';

export default Group.extend({
  type: attr('string', { defaultValue: 'SmallGroup' }),
});
