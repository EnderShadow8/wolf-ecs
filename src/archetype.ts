import {has} from "./sparseset"

class Archetype {
  mask: Uint32Array
  entities: number[] = []
  keys: number[] = []
  change: Archetype[] = []

  constructor(mask: Uint32Array) {
    this.mask = mask
  }

  has(x: number) {
    return has(this.keys, this.entities, x)
  }
}

export {Archetype}
