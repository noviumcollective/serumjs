import Resolver, { Service } from '../lib'
import { MockService, ConsumerService } from './fixtures'

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

    expect(consumerInstance.MockService).toBe(service1)
    expect(consumerInstance.consume()).toEqual(service1.doSomething())
  })

  it('should throw an error if a service is instantiated when its injecting requirements are not registered yet', () => {
    expect(() => {
      new ConsumerService()
    }).toThrow()
  })

  it('should provide an instance to the resolver singleton through getResolver()', () => {
    const service1 = new MockService()

    Resolver.register(service1)

    const consumerService = new ConsumerService()

    expect(consumerService.getResolver()).toBe(Resolver)
  })
})
