

export let globalDep = null

export let renderEffect = null

export function updateGlobalDep(dep) {
  globalDep = dep
}

export function updateRenderEffect(effect) {
  renderEffect = effect
}