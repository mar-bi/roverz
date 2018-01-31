/**
 * Global Util Functions
 */
import { ModuleConfig } from '../constants/';

const Entities = require('html-entities').AllHtmlEntities;

const entities = new Entities();

function striptags(input) {
  return input.replace(/(<([^>]+)>)/ig, '');
}

// Enable debug output when in Debug mode
const DEBUG_MODE = ModuleConfig.DEV;

const UTIL = {
  /**
    * Test if Obj is empty
    */
  objIsEmpty: (obj) => {
    if (obj && typeof obj === 'object' && !(obj instanceof Array)) {
      if (Object.keys(obj).length === 0) return true;
    }
    return false;
  },

  /**
   * Remove empty values from a given associative array
   */
  removeEmptyValues: (obj) => {
    var clone = Object.assign({}, obj);
    Object.keys(clone).forEach((propName) => {
      if (clone[propName] === null || clone[propName] === undefined) {
        delete clone[propName];
      }
    });
    return clone;
  },

  /**
    * Convert Obj to Arr
    */
  objToArr: obj => Object.keys(obj).map(k => obj[k]),

  /**
    * Limit characters, placing a ... at the end
    */
  limitChars: (str, limit = 15) => {
    if (str && str.length > limit) return `${str.substr(0, limit).trim()} ...`;
    return str;
  },

  /**
    * Decode HTML Entites
    */
  htmlEntitiesDecode: str => entities.decode(str),

  /**
    * Debug or not to debug
    */
  debug: (str, title) => {
    if (DEBUG_MODE && (title || str)) {
      if (title) {
        console.log(`=== DEBUG: ${title} ===========================`);
      }
      if (str) {
        console.log(str);
        // // console.log('%c ...', 'color: #CCC');
      }
    }
  },

  /**
    * Avatar Initials
    */
  avatarInitials: (str) => {
    var avatarStr = '';
    if (str && str.trim().length > 0) {
      const tempArr = str.split(/(\s+)/).filter(e => e.trim().length > 0);
      avatarStr = tempArr[0].charAt(0).toUpperCase();
      if (tempArr.length > 1) {
        avatarStr += tempArr[1].trim().charAt(0).toUpperCase();
      }
    }
    return avatarStr;
  },

  /**
    * Convert all HTMLEntities when Array
    */
  convertHtmlEntitiesArray: (arr) => {
    const finalArr = arr;

    if (arr instanceof Array) {
      arr.forEach((item, key) => {
        if (item instanceof Array) {
          finalArr[key] = UTIL.convertHtmlEntitiesArray(item);
        } else if (typeof item === 'object') {
          finalArr[key] = UTIL.convertHtmlEntitiesObject(item);
        } else if (typeof item === 'string') {
          finalArr[key] = entities.decode(striptags(item));
        }
      });
    }

    return finalArr;
  },

  /**
    * Convert all HTMLEntities when Object
    */
  convertHtmlEntitiesObject: (obj) => {
    const finalObj = obj;

    if (typeof obj === 'object' && !(obj instanceof Array)) {
      Object.keys(obj).forEach((key) => {
        const item = obj[key];

        if (item instanceof Array) {
          finalObj[key] = UTIL.convertHtmlEntitiesArray(item);
        } else if (typeof item === 'object') {
          finalObj[key] = UTIL.convertHtmlEntitiesObject(item);
        } else if (typeof item === 'string') {
          finalObj[key] = entities.decode(striptags(item));
        }
      });
    }

    return finalObj;
  },

  /**
    * Strips all HTML tags
    */
  stripTags: str => striptags(str),
};

/* Export ==================================================================== */
module.exports = UTIL;
module.exports.details = {
  title: 'UTIL',
};
