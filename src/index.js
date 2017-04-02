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

  hasDependency(dep) {
    if (typeof dep !== 'string') throw new Error('Invalid argument passed for hasDependency(), expected a string')
    return (this.dependencies[dep])
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
  
  resolve(args, func, scope) {
    scope = scope || {}
    let deps = []
    // prepare for injectables
    if (typeof args === 'string' && this.hasDependency(args)) {
      deps.push(args)
    }
    else if (typeof args === 'object' && !(args instanceof Array) && (args instanceof Service)) {
      deps.push(this.getServiceName(deps))
    } else if (args instanceof Array) {
      deps = [...args]
    }

    deps.map(d => {
      if (typeof d !== 'string') return;
      if (this.hasDependency(d)) {
        if (scope.hasOwnProperty(d)) throw new Error(`Cannot reassign [${d}] on service`)
        scope[d] = this.get(d)
      }
      else throw new Error(`Cannot resolve [${d}]`)
    })

    return function() {
      return func.apply(scope || {}, Array.prototype.slice.call(arguments, 0))
    }
  }
}

let _injectorInstance = null;
function getSharedResolver() {
  if(!_injectorInstance) {
    _injectorInstance = new Injector()
  }
  return _injectorInstance
}

export default getSharedResolver();

export class Service {
  constructor(...args) {
    if (new.target === Service) throw new TypeError('Cannot instantiate [Service] instances directly')
    Object.defineProperties(this, {
      '$name': {
        enumerable: true,
        configurable: false,
        writable: false,
        value: this.constructor.name,
      },
      '$resolver': {
        enumerable: true,
        configurable: false,
        value: getSharedResolver(),
      },
    })
    if (args.length > 0) {
      const resolvables = Array.prototype.slice.call((args[0] instanceof Array) ? args[0] : args)
      const self = this
      this.$resolver.resolve(resolvables, function() {
        for (let p in this) {
          if (this.hasOwnProperty(p)) {
            Object.defineProperty(self, `$${p}`, {
              enumerable: true,
              configurable: false,
              writable: false,
              value: this[p],
            })
          }
        }
      })()
    }
  }
}
