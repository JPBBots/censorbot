/**
 * Key for Collection
 */
type Key = any

/**
 * Value for Collection
 */
type Value = any

export class Collection<Key, Value> extends Map {
  private _keyArray?: Array<Key>
  private _array?: Array<Value>
  private _map: Map<Key, Value>

  constructor() {
    // this._map = new Map()
    super()

    this._array = []
    this._keyArray = []
  }

  // @ts-ignore Returning errors
  set (key: Key, val: Value): this {
    this._array = null
    this._keyArray = null
    super.set(key, val)
    return this
  }

  // @ts-ignore Returning errors
  delete(key: Key): this {
    this._array = null
    this._keyArray = null
    super.delete(key)
    return this
  }

  array(): Array<Value> {
    if (!this._array || this._array.length !== this.size) this._array = [...this.values()]
    return this._array
  }

  keyArray(): Array<Key> {
    if (!this._keyArray || this._keyArray.length !== this.size) this._keyArray = [...this.keys()]
    return this._keyArray
  }

  first(count?: number): Value|Array<Value> {
    if (count === undefined) return this.values().next().value
    if (!Number.isInteger(count) || count < 1) throw new RangeError('The count must be an integer greater than 0.')
    count = Math.min(this.size, count)
    const arr = new Array(count)
    const iter = this.values()
    for (let i = 0; i < count; i++) arr[i] = iter.next().value
    return arr
  }

  last(count?: number): Value|Array<Value> {
    const arr = this.array()
    if (count === undefined) return arr[arr.length - 1]
    if (typeof count !== 'number') throw new TypeError('The count must be a number.')
    if (!Number.isInteger(count) || count < 1) throw new RangeError('The count must be an integer greater than 0.')
    return arr.slice(-count)
  }

  random(count: number): Value|Array<Value> {
    let arr = this.array()
    if (typeof count !== 'number') throw new TypeError('The count must be a number.')
    if (!Number.isInteger(count) || count < 1) throw new RangeError('The count must be an integer greater than 0.')
    if (arr.length === 0) return []
    if (arr.length === 0) return []
    const rand = new Array(count)
    arr = arr.slice()
    for (let i = 0; i < count; i++) rand[i] = arr.splice(Math.floor(Math.random() * arr.length), 1)[0]
    return rand
  }

  find(fn: (value: Value, key: Key, collection: this) => boolean): Value {
    for (const [key, val] of this) {
      if (fn(val, key, this)) return val
    }
    return null
  }

  filter(fn: (value: Value, key: Key, collection: this) => boolean): Collection<any, any> {
    const results = new Collection()
    for (const [key, val] of this) {
      if (fn(val, key, this)) results.set(key, val)
    }
    return results
  }

  map(fn: (value: Value, key: Key, collection: this) => Value): Array<Value> {
    const arr = new Array(this.size)
    let i = 0
    for (const [key, val] of this) arr[i++] = fn(val, key, this)
    return arr
  }

  some(fn: (value: Value, key: Key, collection: this) => boolean): boolean {
    for (const [key, val] of this) {
      if (fn(val, key, this)) return true
    }
    return false
  }

  every(fn: (value: Value, key: Key, collection: this) => boolean): boolean {
    for (const [key, val] of this) {
      if (!fn(val, key, this)) return false
    }
    return true
  }

  reduce(fn: (accumulator: any, value: Value, key: Key, collection: this) => any, initialValue): any {
    let accumulator
    if (typeof initialValue !== 'undefined') {
      accumulator = initialValue
      for (const [key, val] of this) accumulator = fn(accumulator, val, key, this)
    } else {
      let first = true
      for (const [key, val] of this) {
        if (first) {
          accumulator = val
          first = false
          continue
        }
        accumulator = fn(accumulator, val, key, this)
      }
    }
    return accumulator
  }

  tap(fn: (value: Value) => any): this {
    this.forEach(fn)
    return this
  }
}