
export const isArray = val => Array.isArray(val)
export const isObject = val => typeof val === 'object' && val != null
export const isPlainObject = val => isObject(val) && !isArray(val)
export const isString = val => typeof val === 'string'
export const isFunc = val => typeof val === 'function'
export const isSymbol = val => typeof val === 'symbol'
export const noop = () => {}
export const hasChange = (v1, v2) => !Object.is(v1, v2)
export const hasOwnProperty = Object.prototype.hasOwnProperty 
export const hasOwn = (val, key) => hasOwnProperty.call(val, key)
export const isExtensible = val => Reflect.isExtensible(val)
export const isIntegerKey = key =>
  isString(key) &&
  key !== 'NaN' &&
  key[0] !== '-' &&
  '' + parseInt(key, 10) === key
export const bind = (fn, ctx) => fn.bind(ctx)
export const toString = Object.prototype.toString
export const rawType = val => toString.call(val).slice(8, -1)