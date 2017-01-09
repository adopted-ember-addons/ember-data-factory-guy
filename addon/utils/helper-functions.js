/* global requirejs, require */
/*jslint node: true */

import Ember from 'ember';

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
  var aProps = Object.keys(objectA);
  var bProps = Object.keys(objectB);
  if (aProps.length !== bProps.length) {
    return false;
  }
  for (let i = 0; i < aProps.length; i++) {
    let propName = aProps[i];
    let aEntry = objectA[propName];
    let bEntry = objectB[propName];
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

  return filesSeen.filter((moduleName)=> {
    return !excludeRegex.test(moduleName) && filePattern.test(moduleName);
  }).map((moduleName)=> require(moduleName, null, null, true));
}

export function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

export function stripQueryParams(uri) {
  return uri.split('?')[0];
}