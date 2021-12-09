import { isArray, isObject, isExtensible } from './tools.js'

const unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/

const invalidKeyPath = new RegExp(`[^${unicodeRegExp.source}.$_\\d]`)

export function createValueGetter (keyPath) {
  if (invalidKeyPath.test(keyPath)) {
    return noop
  }else {
    return function (context) {
      const arr = keyPath.split('.')
      for (let i = 0; i < arr.length; i++) {
        context = context[arr[i]]
      }
      return context
    }
  }
}

function _deepRead(val, hasRead) {
  if (!isObject(val) || !isExtensible(val)) return
  if (val.__m_raw) {
    if (hasRead.has(val)) return
    hasRead.add(val)
  }
  const isArr = isArray(val)
  if (isArr) {
    val.forEach(item => _deepRead(item, hasRead))
  }else {
    Object.values(val).forEach(item => _deepRead(item, hasRead))
  }
}

export function deepRead (val) {
  const hasRead = new Set()
  _deepRead(val, hasRead)
  hasRead.clear()
}
