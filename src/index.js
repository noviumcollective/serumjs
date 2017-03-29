class _injector {
  constructor() {
    this.dependencies = {}
  }
  getAll() {
    return this.dependencies;
  }
  get(svcName) {
    return this.dependencies[svcName]
  }
  register(svc) {
    this.dependencies[svc.constructor.name] = svc
  }
  resolve(deps, func, scope) {
    scope = scope || {}
    deps.map(d => {
      if (this.dependencies[d])
        scope[d] = this.dependencies[d]
      else
        throw new Error(`Cannot resolve [${d}]`)
    })
    return function() {
      return func.apply(scope || {}, Array.prototype.slice.call(arguments, 0))
    }
  }
}

let _injectorInstance = new _injector()
export default _injectorInstance

export class Service {
  constructor() {
    if (new.target === Service) throw new TypeError("Cannot instantiate Factory instances directly")
    this.name = this.constructor.name
    if (arguments.length > 0) {
      const resolvables = Array.prototype.slice.call((arguments[0] instanceof Array) ? arguments[0] : arguments)
      const self = this
      _injectorInstance.resolve(resolvables, function() {
        Object.assign(self, this)
      })()
    }
  }
}
