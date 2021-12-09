import { typeToDefaultMap, rawType } from '../shared/index.js'

export function compatAndWarn (val, name, typeStr)  {
  const type = rawType(val)
  if (type === typeStr) {
    return val
  }else {
    console.warn(`${ name } need type of ${ typeStr }, but get ${ type }`)
    return typeToDefaultMap.get(typeStr)
  }
}

export function handleError (error) {
  console.error(error)
}

export function invokeWithErrorHandling(handler, context, ...args) {
  let res
  try {
    res = handler.apply(context, args)
  } catch (error) {
    handleError (error)
  }
  return res
}

export function warn (...args) {
  console.warn(...args)
}