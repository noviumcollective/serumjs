const validName = /^[$A-Z_][0-9A-Z_$]*$/i, reserved = {
  'break': true,
  'case': true,
  'catch': true,
  'class': true,
  'const': true,
  'continue': true,
  'debugger': true,
  'default': true,
  'delete': true,
  'do': true,
  'else': true,
  'export': true,
  'extends': true,
  'finally': true,
  'for': true,
  'function': true,
  'if': true,
  'import': true,
  'in': true,
  'instanceof': true,
  'new': true,
  'return': true,
  'super': true,
  'switch': true,
  'this': true,
  'throw': true,
  'try': true,
  'typeof': true,
  'var': true,
  'void': true,
  'while': true,
  'with': true,
  'yield': true,
}

export const isValidFuncName = (s) => validName.test(s) && !reserved[s]

export class Injector {
  constructor() {
    this.dependencies = {}
  }
  
  getAll() {
    return Object.keys(this.dependencies).map(key => this.dependencies[key])
  }

  get(svcName) {
    return this.dependencies[svcName]
  }

  getServiceName(svc) {
    return Object.keys(this.dependencies).find(key => this.dependencies[key] === svc)
  }

  register(svc) {
    if(svc instanceof Array)
      svc.map(s => {
        this._registerInternal(s)
      })
    else
      this._registerInternal(svc)
  }

  registerNamed(svc, name) {
    this._registerInternal(svc, name)
  }

  _registerInternal(svc, name) {
    name = name || svc.constructor.name
    if (this.dependencies[name]) {
      throw new Error(`Another service was registered under the name [${name}]. If this was intentional, try unregistering the existing one first.`)
    }
    this.getAll().map(s => {
      if(s === svc) {
        const oldName = this.getServiceName(svc)
        throw new Error(`This instance of [${name}] is already registered as [${oldName}]. You may want to unregister [${oldName}] first.`)
      }
    })

    if (isValidFuncName(name)) {
      this.dependencies[name] = svc
    } else {
      throw new Error(`${name} is not a valid name`)
    }
  }

  unregister(name) {
    delete this.dependencies[name]
  }

  unregisterAll() {
    Object.keys(this.dependencies).forEach(key => { delete this.dependencies[key] })
  }

  resolve(deps, func, scope) {
    scope = scope || {}
    if (typeof deps === 'string') deps = [deps]
    if(deps instanceof Array)
      deps.map(d => {
        if (this.dependencies[d])
          scope[d] = this.get(d)
        else
          throw new Error(`Cannot resolve [${d}]`)
      })
    else
      throw new Error(`Dependencies are not provided to Resolver, pass in a service name or an array of service names as the first argument of resolve function`)
    return function() {
      return func.apply(scope || {}, Array.prototype.slice.call(arguments, 0))
    }
  }
}

const _injectorInstance = new Injector()

export class Service {
  constructor() {
    if (new.target === Service) throw new TypeError("Cannot instantiate [Service] instances directly")
    this._resolver = _injectorInstance;
    this.name = this.constructor.name
    if (arguments.length > 0) {
      const resolvables = Array.prototype.slice.call((arguments[0] instanceof Array) ? arguments[0] : arguments)
      const self = this
      this.getResolver().resolve(resolvables, function() {
        Object.assign(self, this)
      })()
    }
  }
  
  getResolver() {
    return this._resolver;
  }
}

export default _injectorInstance
