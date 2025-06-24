import { typeOf } from '@ember/utils';

export function param(obj, prefix) {
  let str = [],
    p;
  for (p in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, p)) {
      var k = prefix ? prefix + '[' + (isNaN(p) ? p : '') + ']' : p,
        v = obj[p];
      str.push(
        v !== null && typeof v === 'object'
          ? param(v, k)
          : encodeURIComponent(k) + '=' + encodeURIComponent(v),
      );
    }
  }
  return str.join('&');
}

export function isEmptyObject(obj) {
  return !isObject(obj) || Object.keys(obj).length === 0;
}

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
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
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (isObject(source[key])) {
          if (!target[key]) {
            Object.assign(target, { [key]: {} });
          }
          mergeDeep(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }
  }

  return mergeDeep(target, ...sources);
}

export function isEquivalent(a, b) {
  var type = typeOf(a);
  if (type !== typeOf(b)) {
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

function arrayIsEquivalent(arrayA, arrayB) {
  if (arrayA.length !== arrayB.length) {
    return false;
  }
  return arrayA.every(function (item, index) {
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
      aEntry = objectA[propName],
      bEntry = objectB[propName];
    if (!isEquivalent(aEntry, bEntry)) {
      return false;
    }
  }
  return true;
}

/**
 * Used to split a url with query parms into url and queryParams
 * MockLinks and Mock both use this
 *
 * @param url
 * @returns {*[]}
 */
export function parseUrl(url) {
  const [urlPart, query] = (url || '').split('?');
  const params =
    (query &&
      query.split('&').reduce((params, param) => {
        let [key, value] = param.split('=');
        params[key] = value
          ? decodeURIComponent(value.replace(/\+/g, ' '))
          : '';
        return params;
      }, {})) ||
    {};

  return [urlPart, params];
}
