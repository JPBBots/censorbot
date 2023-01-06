import { EventEmitter, ExtendedEmitter } from '@jpbberry/typed-emitter'

export class EventAdder<B extends EventEmitter<any>> extends ExtendedEmitter {
  constructor(adder: B) {
    super()

    this.add(adder)
  }
}
