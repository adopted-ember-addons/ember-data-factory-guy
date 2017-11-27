/* global requirejs */
import Ember from 'ember';
import require from 'require';
import { assign } from '@ember/polyfills';

/**
 *
 * @param obj
 */
export function toParams(obj) {
  return parseParms(decodeURIComponent(Ember.$.param(obj)));
}

function parseParms(str) {
  let pieces = str.split("&"),
      data   = {},
      i, parts, key, value;

  // Process each query pair
  for (i = 0; i < pieces.length; i++) {
    parts = pieces[i].split("=");

    // No value, only key
    if (parts.length < 2) {
      parts.push("");
    }

    key = decodeURIComponent(parts[0]);
    value = decodeURIComponent(parts[1]);

    // Key is an array
    if (key.indexOf("[]") !== -1) {
      key = key.substring(0, key.indexOf("[]"));

      // Check already there
      if ("undefined" === typeof data[key]) {
        data[key] = [];
      }

      data[key].push(value);
    } else {
      data[key] = value;
    }
  }
  return data;
}

export function isEmptyObject(obj) {
  return !isObject(obj) || Object.keys(obj).length === 0;
}

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) {
          assign(target, { [key]: {} });
        }
        mergeDeep(target[key], source[key]);
      } else {
        assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

export function isEquivalent(a, b) {
  var type = Ember.typeOf(a);
  if (type !== Ember.typeOf(b)) {
    return false;
  }
  switch (type) {
    case 'object':
      return objectIsEquivalent(a, b);
    case 'array':
      return arrayIsEquivalent(a, b);
    default:
      return a === b;
  }
}

export function isPartOf(object, part) {
  return Object.keys(part).every(function(key) {
    return isEquivalent(object[key], part[key]);
  });
}

function arrayIsEquivalent(arrayA, arrayB) {
  if (arrayA.length !== arrayB.length) {
    return false;
  }
  return arrayA.every(function(item, index) {
    return isEquivalent(item, arrayB[index]);
  });
}

function objectIsEquivalent(objectA, objectB) {
  let aProps = Object.keys(objectA),
      bProps = Object.keys(objectB);
  if (aProps.length !== bProps.length) {
    return false;
  }
  for (let i = 0; i < aProps.length; i++) {
    let propName = aProps[i],
        aEntry   = objectA[propName],
        bEntry   = objectB[propName];
    if (!isEquivalent(aEntry, bEntry)) {
      return false;
    }
  }
  return true;
}

// always exclude jshint or jscs files
export const excludeRegex = new RegExp('[^\s]+(\\.(jscs|jshint))$', 'i');

/**
 * Find files that have been seen by some tree in the application
 * and require them. Always exclude jshint and jscs files
 *
 * @param filePattern
 * @returns {Array}
 */
export function requireFiles(filePattern) {
  let filesSeen = Object.keys(requirejs._eak_seen);

  return filesSeen.filter((moduleName) => {
    return !excludeRegex.test(moduleName) && filePattern.test(moduleName);
  }).map((moduleName) => require(moduleName, null, null, true));
}
