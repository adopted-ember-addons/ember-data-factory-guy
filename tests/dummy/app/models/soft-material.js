import Material from './material';
import { belongsTo } from '@ember-data/model';

export default Material.extend({
  hat: belongsTo('big-hat', { async: false }),
});
