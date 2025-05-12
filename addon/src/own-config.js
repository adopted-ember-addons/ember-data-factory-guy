import { getOwnConfig, macroCondition } from '@embroider/macros';
import { assert } from '@ember/debug';

let stringsOnly = false;

if (macroCondition(getOwnConfig()?.useStringIdsOnly)) {
  stringsOnly = true;
} else {
  stringsOnly = false;
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

export const useStringIdsOnly = stringsOnly;
