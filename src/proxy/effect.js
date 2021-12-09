import { isString, createValueGetter, deepRead } from '../shared/index.js'
import { createDep } from './dep'
import { handleError } from '../remind/index.js'
import { globalDep } from '../global/index.js'
import { updatePendingData } from '../mini/index.js'

let effectId = 0

// Effect 
class Effect {
  constructor(context, updater, callback, lazy, deep, isComputed, isRender, computedKey ) {
    this.id = effectId++
    this.context = context
    this.updater = updater,
    this.callback = callback
    this.lazy = lazy,
    this.deep = deep
    this.isComputed = isComputed
    this.computedKey = computedKey
    this.isRender = isRender
    this.dirty = true,
    this.oldDeps = new Set()
    this.newDeps = new Set()
    this.value = this.lazy ? undefined : this.get()

    this.context._effects.add(this)
  }
  get() {
    pushEffectStack(this)
    let value
    try {
      value = this.updater.call(this.context, this.context)
    } catch (error) {
      handleError(error)
    } finally {
      this.deep && deepRead(value)
      popEffectStack()
      !this.isRender && this.refresh()
    }
    return value
  }
  run() {
    if (this.isComputed) {
      this.dirty = true
      return
    }
    const oldValue = this.value
    const newValue = this.value = this.get()

    if (oldValue !== newValue) {
      try {
        this.callback.call(this.context, oldValue, newValue)
      } catch (error) {
        handleError(error)
      }
    }
  }
  compute() {
    this.value = this.dirty ? this.get() : this.value
    this.dirty = false
  }
  refresh() {
    for(let dep of this.oldDeps) {
      !this.newDeps.has(dep) && dep.delete(this)
    }
    this.oldDeps = new Set([...this.newDeps])
    this.newDeps.clear()
  }
  remove() {
    for(let dep of this.oldDeps) {
      dep.delete(this)
    }
    this.context._effects.delete(this)
  }
}


export let activeEffect = null
let effectStack = []

const keyPathToDepMap = new Map()

export function createEffect (context, updater, callback = () => {}, options = {}) {
  const { lazy, deep, isComputed, isRender, computedKey } = options
  if (isString(updater)) {
    updater = createValueGetter(updater)
  }
  const effect = new Effect(context, updater, callback, lazy, deep, isComputed, isRender, computedKey)
  return effect
}

export function track (keyPath) {
  let dep = keyPathToDepMap.get(keyPath)
  !dep && keyPathToDepMap.set(keyPath, dep = createDep())
  dep.add(activeEffect)
  activeEffect.newDeps.add(dep)
}

export function trigger (keyPath, value) {
  let dep = keyPathToDepMap.get(keyPath) || globalDep
  for(let effect of dep) {
    schedule(effect, keyPath, value)
  }
}

let effectQueue = []
const idSet = new Set()
let isFlushing = false
let circulIdToCountMap = new Map()
const MAXCIRCULALLOW = 100


function _nextTick (cb) {
  Promise.resolve().then(cb)
}

export function nextTick (cb) {
  !effectQueue.length ? _nextTick(cb) : _instance.setData({}, cb)
}

function resetScheduleState() {
  idSet.clear()
  isFlushing = false
  circulIdToCountMap.clear()
  effectQueue = []
}

function schedule (effect, keyPath, value) {
  const { id, isComputed, isRender } = effect
  isRender && updatePendingData(keyPath, value)
  if (isComputed) {// Computed updated sync (but still render async)
    effect.run()
    effect.compute()
    trigger(effect.computedKey, effect.value)
    return
  } 
  if (!idSet.has(id)) { // render & watch update async
    idSet.add(id)
    if (isFlushing) {
      let postIndex = effectQueue.findIndex(effect => effect.id < id)
      postIndex === -1 && (postIndex = effectQueue.length)
      effectQueue.splice(postIndex, 0, effect)
    }else {
      effectQueue.push(effect)
    }
    !isFlushing && _nextTick(flushEffectQueue)
  }
}

function flushEffectQueue() {
  isFlushing= true
  effectQueue.sort((a, b) => a.id - b.id) // up sort
  for (let i = 0; i < effectQueue.length; i++) {
    let effect = effectQueue[i]
    const id = effect.id
    idSet.delete(id)
    effect.run()
    if (idSet.has(id)) {
      // circule udpate 
      let count = circulIdToCountMap.get(id)
      circulIdToCountMap.set(id, count ? count++ : (count = 0))
      if (count > MAXCIRCULALLOW) {
        // console.error('循环赋值，请核查代码')
      }
    }
  }
  resetScheduleState()
}


export function pushEffectStack (effect) {
  effectStack.push(effect)
  activeEffect = effect
}

export function popEffectStack () {
  effectStack.pop()
  activeEffect = effectStack[effectStack.length - 1]
}