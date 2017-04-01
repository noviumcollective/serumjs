import Resolver, { Service } from '../lib'
import { MockService, AnotherMockService } from './fixtures'

describe('Resolver tests', () => {
  afterEach(() => {
    Resolver.unregisterAll()
  })

  it('should initialize with zero dependencies', () => {
    expect(Resolver.dependencies).toEqual({})
  })

  it('should register a service successfully', () => {
    const service = new MockService()
    Resolver.register(service)
    expect(Resolver.get('MockService')).toBe(service)
  })

  it('should register multiple services at once', () => {
    const service1 = new MockService()
    const service2 = new AnotherMockService()
    Resolver.register([
      service1,
      service2,
    ])
    expect(Resolver.getAll().length).toEqual(2)
  })

  it('should not allow a service to be registered twice', () => {
    const service1 = new MockService()
    const service2 = new MockService()
    expect(() => {
      Resolver.register([
        service1,
        service2,
      ])
    }).toThrow()
  })

  it('should allow a new instance of a service to be registered if the original instance was unregistered', () => {
    const service1 = new MockService()
    const service2 = new MockService()

    // register service1
    Resolver.register(service1)

    // don't allow another service to be registered under the same name
    expect(() => {
      Resolver.register(service2)
    }).toThrow()

    // unregister original instance, then register another one
    Resolver.unregister('MockService')
    expect(() => {
      Resolver.register(service2)
    }).not.toThrow()

    // should pass
    expect(Resolver.get('MockService')).toBe(service2)
  })

  it('should return the inferred name of a service', () => {
    const service1 = new MockService()

    Resolver.register(service1)

    expect(Resolver.getServiceName(service1)).toEqual('MockService')
  })

  it('should allow a service to be registered under a custom alias', () => {
    const service1 = new MockService()

    Resolver.registerNamed(service1, 'ShippingService')
    
    expect(Resolver.get('ShippingService')).toBe(service1)
  })

  it('should not allow a service instance to be registered twice, even when under a different alias', () => {
    const service1 = new MockService()

    Resolver.registerNamed(service1, 'ShippingService')

    expect(() => {
      Resolver.register(service1)
    }).toThrow()
  })

  it('should provide an array of registered services to a function retaining its arguments', () => {
    const service1 = new MockService()
    const service2 = new AnotherMockService()

    Resolver.register([
      service1,
      service2,
    ])

    const testFunc = Resolver.resolve(['MockService', 'AnotherMockService'], function(arg1, arg2) {
      expect(this.MockService).toBe(service1)
      expect(this.AnotherMockService).toBe(service2)
      expect(arg1).toEqual(1)
      expect(arg2).toEqual(2)
    })

    testFunc(1, 2)
  })

  it('should provide a single service to function', () => {
    const service1 = new MockService()

    Resolver.register(service1)

    const testFunc = Resolver.resolve('MockService', function(arg1, arg2) {
      expect(this.MockService).toBe(service1)
      expect(arg1).toEqual(1)
      expect(arg2).toEqual(2)
    })

    testFunc(1, 2)
  })

  it('should throw an error if services are not provided to Resolver.resolve', function() {
    const noop = function() { }
    expect(() => {
      Resolver.resolve(noop)
    }).toThrow()
  })

  it('should apply additional scope to resolved function when provided', () => {
    const additionalScope = {
      name: 'Nick',
      age: 35,
    }

    Resolver.register(new MockService())

    const testFunc = Resolver.resolve('MockService', function(arg1, arg2) {
      expect(this.MockService)
      expect(arg1).toEqual(1)
      expect(arg2).toEqual(2)

      // additional scope
      expect(this.name).toEqual('Nick')
      expect(this.age).toEqual(35)

    }, additionalScope)
    
    testFunc(1, 2)
  })
})
