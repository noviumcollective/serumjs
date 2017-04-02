import Resolver, { Service } from '../src'
import { MockService, ConsumerService, AwesomeService } from './fixtures'

describe('Service tests', () => {
  afterEach(() => {
    Resolver.unregisterAll()
  })

  it('should now allow instantiating a Service class', () => {
    expect(() => new Service()).toThrow()
  })

  it('should provide services to Service classes via the service constructor', () => {
    const service1 = new MockService()

    Resolver.register(service1)

    const consumerInstance = new ConsumerService()

    expect(consumerInstance.$MockService).toBe(service1)
    expect(consumerInstance.consume()).toEqual(service1.doSomething())
  })

  it('should return the service class name string from $name property', () => {
    const service1 = new MockService()

    expect(service1.$name).toEqual('MockService')
  })

  it('should throw an error if a service is instantiated when its injecting requirements are not registered yet', () => {
    expect(() => {
      new ConsumerService()
    }).toThrow()
  })

  it('should provide an reference to the resolver singleton through $resolver prop', () => {
    const service1 = new MockService()

    Resolver.register(service1)

    const consumerService = new ConsumerService()

    expect(consumerService.$resolver).toBe(Resolver)
  })

  it('should not allow service to request duplicate injections', () => {
    class WickedService extends Service {
      constructor() {
        super('MockService', 'MockService')
      }
    }

    Resolver.register(new MockService())

    expect(() => {
      new WickedService()
    }).toThrow()
  })

  it('should not allow provided service property to be overwritten', () => {
    const service1 = new MockService()

    Resolver.register(service1)

    const consumerService = new ConsumerService()
    expect(consumerService.$MockService).toBe(service1)

    expect(() => {
      consumerService.$MockService = 'foo' // not allowed
    }).toThrow()

    expect(consumerService.$MockService).toBe(service1)
  })

  it('should allow Service state to be shared between two consumers', () => {
    const service1 = new MockService()

    Resolver.register(service1)

    const consumer1 = new ConsumerService()
    const consumer2 = new ConsumerService()

    expect(Resolver).toBe(consumer1.$resolver)

    expect(service1.count()).toEqual(0)

    consumer1.$MockService.incr()

    expect(service1.count()).toEqual(1)
    expect(consumer2.$MockService.count()).toEqual(1)
  })

  it('should support subclassing and constructor overriding of base classes', () => {
    const service1 = new MockService()
    Resolver.register(service1)

    const awService = new AwesomeService()

    expect(awService.pathPrefix).toEqual('/api/')
    expect(awService.$MockService).toBe(service1)
    expect(awService.doSomething(5)).toEqual(47)
  })
})
