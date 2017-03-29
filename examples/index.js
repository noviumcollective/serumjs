import Resolver, { Service } from '../lib'

class NotificationService extends Service {
  notify(from, msg) {
    console.log(`[${from}]:`, msg)
  }
}
Resolver.register(new NotificationService())

class RouterService extends Service {
  goTo(path) {
    console.log(`Routing to ${path}`)
  }
}
Resolver.register(new RouterService())

class Cat extends Service {
  constructor() {
    super('NotificationService', 'RouterService')
  }

  meow() {
    this.NotificationService.notify('Cat', 'Meow Meow!')
    this.RouterService.goTo('http://www.lolcats.com/')
  }
}
Resolver.register(new Cat())

class Kittie extends Service {
  constructor() {
    super('Cat', 'NotificationService')
  }

  makeACuteFace() {
    this.Cat.meow()
    this.NotificationService.notify('Kittie', 'Purrrrrr')
  }
}

const chuckles = new Kittie()
chuckles.makeACuteFace()

const doSomething = Resolver.resolve(['NotificationService', 'RouterService'], function(additionalParams) {
  this.NotificationService.notify('Jim', 'Hey, is it you Nick?')
  this.RouterService.goTo('https://novium.io')
  console.log(additionalParams)
})

doSomething(42)
