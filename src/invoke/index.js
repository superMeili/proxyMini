import { isFunc } from '../shared/index.js'
import { invokeWithErrorHandling } from '../remind/index.js'
import { pushEffectStack, popEffectStack } from '../proxy/index.js'

export function callHook (context, hookName, ...args) {
  pushEffectStack(null)
  const hook = context.options[hookName]
  invokeWithErrorHandling(hook, context, ...args)
  popEffectStack()
}

export function callHookWidthMini (miniHook, hookName, context, ...args) {
  isFunc(miniHook) ? miniHook.call(context) : callHook(context, hookName, ...args)
}