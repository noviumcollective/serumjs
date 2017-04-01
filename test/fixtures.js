import { Service } from '../lib'

export class MockService extends Service {
  doSomething() {
    return 42
  }
}

export class AnotherMockService extends Service {
  doSomethingElse() {
    return 'doing something else'
  }
}

export class ConsumerService extends Service {
  constructor() {
    super('MockService')
  }

  consume() {
    return this.MockService.doSomething()
  }
}

