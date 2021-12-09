import { isArray, isFunc, bind, hasOwn, isPlainObject, isString, noop } from '../shared/index.js'
import { nextTick, pushEffectStack, popEffectStack, reactive, createEffect, activeEffect, createDep } from '../proxy/index.js'
import { compatAndWarn, invokeWithErrorHandling, warn } from '../remind/index.js'
import { updateGlobalDep, updateRenderEffect, renderEffect } from '../global/index.js'
import { injectMiniInstance, render } from '../mini/index.js'

export function initContext (context) {
  context._effects = new Set()
  context.$watch = watch
  context.$nextTick = nextTick
  context.options = {}
}

export function initLifeHooks (lifeHooksMap, context) {
  const keys = Object.keys(lifeHooksMap)
  keys.forEach(key => {
    const hook = lifeHooksMap[key]
    context.options[key] = isFunc(hook) ? hook : noop
  })
}

export function initMethods (methods, context) {
  methods = compatAndWarn(methods, 'methods', 'Object')
  const keys = Object.keys(methods)
  const methodsMap = Object.create(null)
  keys.forEach(key => {
    let handler = methods[key]
    handler = context[key] = isFunc(handler) ? bind(handler, context) : noop
    methodsMap[key] = function (...args) {
      handler(...args)
    }
  })
  return methodsMap
}

const baseProprtyConfig = {
  configurable: true,
  enumerable: true
}

function defineProxy (target, source, key) {
  Object.defineProperty(target, key, {
    ...baseProprtyConfig,
    get() {
      return source[key]
    },
    set(value) {
      source[key] = value
    }
  })
}

function getData(fn, context) {
  let res
  pushEffectStack(null)
  res = invokeWithErrorHandling(fn, context, context)
  popEffectStack()
  return res
}

export function initData (data, context) {
  if (isFunc(data)) {
    data = getData(data, context)
  }
  data = compatAndWarn(data, 'data', 'Object')
  const keys = Object.keys(data)
  const proxyData = reactive(data, '', null)
  keys.forEach(key => {
    defineProxy(context, proxyData, key)
  })
  return proxyData
}

export function initComputed (computed, context) {
  computed = compatAndWarn(computed, 'computed', 'Object')
  const keys = Object.keys(computed)
  const proxyComputed = Object.create(null)
  keys.forEach(key => {
    if(hasOwn(context, key)) return warn('computed name cannot repeat width data or methods name')
    const current = computed[key]
    let getter = noop, setter = noop
    if (isFunc(current)) {
      getter = current
    }else if (isPlainObject(current)) {
      const { get, set } = current
      isFunc(get) && (getter = get)
      isFunc(set) && (setter = set)
    }
    const effect = createEffect(context, getter, noop, {
      lazy: true,
      isComputed: true,
      computedKey: key
    })
    Object.defineProperty(context, key, {
      ...baseProprtyConfig,
      get() {
        effect.compute()
        effect.oldDeps.forEach(dep => activeEffect && dep.add(activeEffect))
        return effect.value
      },
      set(value) {
        setter.call(context, value)
      }
    })
    Object.defineProperty(proxyComputed, key, {
      ...baseProprtyConfig,
      get() {
        return context[key]
      }
    })
  })
  return proxyComputed
}

export function initWatch (watch, context) {
  watch = compatAndWarn(watch, 'watch', 'Object')
  const keys = Object.keys(watch)
  keys.forEach(key => {
    const option = watch[key]
    context.$watch(key, option)
  })
}

export function watch (getter, option) {
  let handler = noop, immediate = false, deep = false
  if (isFunc(option)) {
    handler = option
  }else if (isArray(option)) {
    option.forEach(item => {
      watch.call(this, getter, item)
    })
  }else if (isPlainObject(option)) {
    immediate = !!option.immediate
    deep = !!option.deep
    handler = isFunc(option.handler) ? option.handler : noop
  }else if (isString(option)) {
    handler = this && this[option] || noop
  }
  const effect = createEffect(this, getter, handler, {
    deep
  })
  if (immediate) {
    handler.call(this, effect.value)
  }
  return () => effect.remove()
}

export function initOtherConfig (config, context) {
  const excludes = [ 
    "onLoad",
    "onShow",
    "onReady",
    "onHide",
    "onUnload", 
  ]
  const keys = Object.keys(config).filter(key => !excludes.includes(key))
  const others = {}
  keys.forEach(key => {
    const option = config[key]
    others[key] = isFunc(option) ? bind(option, context) : option
  })
  return others
}


export function initStart (context) {
  let renderEffect = createEffect(context, render, noop, {
    lazy: true,
    isRender: true
  })
  updateRenderEffect(renderEffect)
  let globalDep = createDep(renderEffect)
  updateGlobalDep(globalDep)
  pushEffectStack(renderEffect)
}

export function initEnd (_instance) {
  injectMiniInstance(_instance)
  popEffectStack()
  renderEffect.refresh()
}
