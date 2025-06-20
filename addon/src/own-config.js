import { getOwnConfig, macroCondition } from '@embroider/macros';
import { assert } from '@ember/debug';

let _stringsOnly = false;
let _interceptor = 'pretender';

if (macroCondition(getOwnConfig()?.useStringIdsOnly)) {
  _stringsOnly = true;
} else {
  _stringsOnly = false;
}
if (macroCondition(getOwnConfig()?.interceptor === 'msw')) {
  _interceptor = 'msw';
} else if (macroCondition(getOwnConfig()?.interceptor === 'pretender')) {
  _interceptor = 'pretender';
}

/**
 * A function to help check if an id conforms to the configuration of useStringIdsOnly
 *
 * Ensures either the id is string, or they've disabled useStringIdsOnly
 */
export function verifyId(id) {
  assert(
    `[ember-data-factory-guy]: non-string id given, but useStringIdsOnly config is set`,
    typeof id === 'string' || !useStringIdsOnly,
  );
}

export const useStringIdsOnly = _stringsOnly;
export const interceptor = _interceptor;
