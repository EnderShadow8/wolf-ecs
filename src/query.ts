import Archetype from "./archetype"

type QueryMask = [Uint32Array, Uint32Array]

class Query {
  mask: QueryMask
  archetypes: Archetype[] = []

  constructor(mask: QueryMask) {
    this.mask = mask
  }

  static match(target: Uint32Array, mask: QueryMask) {
    for(let i = 0; i < mask[0].length; i++) {
      if((target[i] & mask[0][i]) !== mask[0][i]) {
        return false
      }
    }
    for(let i = 0; i < mask[1].length; i++) {
      if((target[i] & mask[1][i]) > 0) {
        return false
      }
    }
    return true
  }
}

export default Query
