class Archetype {
  mask: Uint32Array
  entities: number[] = []
  keys: number[] = []
  change: Archetype[] = []

  constructor(mask: Uint32Array) {
    this.mask = mask
  }

  has(x: number) {
    return this.entities[this.keys[x]] === x
  }

  add(x: number) {
    if(!this.has(x)) {
      this.keys[x] = this.entities.length
      this.entities.push(x)
    }
  }

  remove(x: number) {
    if(this.has(x)) {
      const last = this.entities.pop()!
      if(x !== last) {
        this.keys[last] = this.keys[x]
        this.entities[this.keys[x]] = last
      }
    }
  }
}

export {Archetype}
