import Material from './material';
import {belongsTo} from 'ember-data/relationships';

export default Material.extend({
  hat: belongsTo('big-hat', { async: false })
});
