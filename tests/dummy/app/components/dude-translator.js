import { computed } from '@ember/object';
import Component from '@ember/component';

/**
 * Dude Translator
 */
export default Component.extend({
  classNames: ['translator'],

  translation: computed('original', function () {
    return this.original + ' dude';
  }),
});
