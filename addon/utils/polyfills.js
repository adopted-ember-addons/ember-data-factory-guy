// https://github.com/adopted-ember-addons/ember-data-factory-guy/issues/479
// Delete this polyfill when ready to drop support for IE11
import { assign as emberAssign } from '@ember/polyfills';

export const assign = Object.assign || emberAssign;