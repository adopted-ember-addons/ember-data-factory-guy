import { typeOf } from '@ember/utils';

const plusRegex = new RegExp('\\+', 'g');

export function paramsFromRequestBody(body) {
  let params = {};

  if (typeof body === 'string') {
    if (body.match(/=/)) {
      body = decodeURIComponent(body).replace(plusRegex, ' ');

      (body.split('&') || []).map((param) => {
        const [key, value] = param.split('=');
        params[key] = value;
      });
    } else if (body.match(/:/)) {
      params = JSON.parse(body);
    }
    return params;
  }

  return body;
}

export function toParams(obj) {
  return parseParms(decodeURIComponent(param(obj)));
}

export function param(obj, prefix) {
  let str = [],
    p;
  for (p in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, p)) {
      var k = prefix ? prefix + '[' + p + ']' : p,
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

function parseParms(str) {
  let pieces = str.split('&'),
    data = {},
    i,
    parts,
    key,
    value;

  // Process each query pair
  for (i = 0; i < pieces.length; i++) {
    parts = pieces[i].split('=');

    // No value, only key
    if (parts.length < 2) {
      parts.push('');
    }

    key = decodeURIComponent(parts[0]);
    value = decodeURIComponent(parts[1]);

    // Key is an array
    if (key.indexOf('[]') !== -1) {
      key = key.substring(0, key.indexOf('[]'));

      // Check already there
      if ('undefined' === typeof data[key]) {
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

export function isPartOf(object, part) {
  return Object.keys(part).every(function (key) {
    return isEquivalent(object[key], part[key]);
  });
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
