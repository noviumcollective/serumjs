import { Service } from '../src'

export class MockService extends Service {
  constructor() {
    super()
    this.counter = 0
  }

  incr() {
    this.counter++
  }

  decr() {
    this.counter--
  }

  count() {
    return this.counter
  }

  doSomething() {
    return 42
  }
}

export class APIBase extends Service {
  constructor(pathPrefix) {
    super('MockService')
    this.pathPrefix = pathPrefix
  }

  doSomething() {
    return 42
  }
}

export class AwesomeService extends APIBase {
  constructor() {
    super('/api/')
  }

  doSomething(withNumber) {
    return super.doSomething() + withNumber
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
    return this.$MockService.doSomething()
  }
}

