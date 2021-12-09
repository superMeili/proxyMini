import { isArray, isIntegerKey, isSymbol, isObject, isExtensible, hasChange } from '../shared/index.js'
import { track, trigger, activeEffect } from './effect.js'

const targetPathMap = new WeakMap
const targetParentMap = new WeakMap

function getKeyPathRaw (target, key) {
  const parent = targetParentMap.get(target)
  const path = targetPathMap.get(target)

  let parentReadArrayKey = isArray(parent) && isIntegerKey(path)
  let targetReadArrayKey = isArray(target) && isIntegerKey(key)

  return `${ parent? getKeyPath(parent, ''): '' }${ parentReadArrayKey ? '[' + path + ']' : path }.${ targetReadArrayKey ? '[' + key + ']' : key }`
}

function getKeyPath (target, key) {
  const KeyPathRaw = getKeyPathRaw(target, key)
  return KeyPathRaw.replace(/\.(\[)/g, '$1')
}

const proxyHandle = {
  get(target, key, receiver) {
    if (key === '__m_raw') return target
    let res = Reflect.get(target, key, receiver)
    if (isSymbol(key)) return res
    let keyPath = getKeyPath(target, key).slice(1)
    activeEffect && track(keyPath)
    res = isObject(res) ? reactive(res, key, target) : res
    return res
  },
  set(target, key, value, receiver) {
    let oldValue = Reflect.get(target, key, receiver)
    let keyPath = getKeyPath(target, key).slice(1)
    let result = Reflect.set(target, key, value, receiver)

    if (result && hasChange(value, oldValue)) {
      if (isArray(target) && key === 'length') {
        keyPath = targetPathMap.get(target) 
        value = target.slice(0, value)
      }
      trigger(keyPath, value)
    }
    return result
  }
}

export function reactive (target, path, parent) {
  if (target.__m_raw || !isExtensible(target)) return target
  targetPathMap.set(target, path) 
  targetParentMap.set(target, parent)
  const proxy = new Proxy(target, proxyHandle) 
  return proxy
}