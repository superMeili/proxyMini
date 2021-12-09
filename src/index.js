import { initContext, initLifeHooks, initMethods, initData, initComputed, initWatch, initOtherConfig, initStart, initEnd } from './init/index.js'
import { callHook, callHookWidthMini } from './invoke/index.js'
import { _instance } from './mini/index.js'
// entry
export default function proxyMini(config) {
  const { 
    data = {}, 
    computed = {}, 
    watch = {}, 
    methods = {}, 
    beforeCreate, 
    created, 
    beforeMount, 
    mounted, 
    destroyed,
    activated,
    deactivated,
    ...otherConfig 
  } = config

  const context = Object.create(null)
  initContext(context)
  initLifeHooks({ beforeCreate, created, beforeMount, mounted, destroyed, activated, deactivated }, context)
  callHook(context, 'beforeCreate')
  const _methods = context.options.methods = initMethods(methods, context)
  const _data = context.options.data = initData(data, context)
  const _computed = context.options.computed = initComputed(computed, context)
  initWatch(watch, context)
  callHook(context, 'created')

  function onLoad (options) {
    initEnd(this)
    context._instance = _instance
    callHookWidthMini(otherConfig.onLoad, 'beforeMount', context, options)
  }

  function onShow () {
    callHookWidthMini(otherConfig.onShow, 'activated', context)
  }

  function onReady () {
    callHookWidthMini(otherConfig.onReady, 'mounted', context)
  }

  function onHide () {
    callHookWidthMini(otherConfig.onHide, 'deactivated', context)
  }

  function onUnload () {
    callHookWidthMini(otherConfig.onUnload, 'destroyed', context)
    context = null
  }

  const others = initOtherConfig(otherConfig, context)

  initStart(context)
  
  let dataCollection = {
    ..._data,
    ..._computed
  }
  return {
    data: dataCollection,
    ..._methods,
    onLoad,
    onShow,
    onReady,
    onHide,
    onUnload,
    ...others
  }
}