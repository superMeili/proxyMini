


export let _instance = null // mini instance

export let pendingData = {}


// 小程序实例注入器
export function injectMiniInstance(instance) {
  _instance = instance
}

export function updatePendingData (keyPath, value) {
  return pendingData = {
    ...pendingData,
    [keyPath] : value
  }
}

// 渲染方法
export function render (context) {
  _instance.setData(pendingData, () => {
    pendingData = {}
  })
}