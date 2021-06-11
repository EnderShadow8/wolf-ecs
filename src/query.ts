import {Archetype} from "./archetype"

type QueryMask = PartialQueryMask[]
type PartialQueryMask = [Uint32Array, Uint32Array]

class Query {
  mask: QueryMask
  archetypes: Archetype[] = []

  constructor(mask: QueryMask) {
    this.mask = mask
  }

  static match(target: Uint32Array, query: QueryMask) {
    if(!Query.matchAll(target, query[0])) { // AND
      return false
    }
    for(let q of query.slice(1)) { // OR
      if(!Query.matchAny(target, q)) {
        return false
      }
    }
    return true
  }

  // TODO: remove code duplication
  static matchAll(target: Uint32Array, mask: PartialQueryMask) {
    for(let i = 0; i < mask[0].length; i++) {
      if((target[i] & mask[0][i]) < mask[0][i]) {
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

  static matchAny(target: Uint32Array, mask: PartialQueryMask) {
    for(let i = 0; i < mask[0].length; i++) {
      if((target[i] & mask[0][i]) > 0) {
        return true
      }
    }
    for(let i = 0; i < mask[1].length; i++) {
      if((target[i] & mask[1][i]) < mask[1][i]) {
        return true
      }
    }
    return false
  }
}

export {Query, QueryMask, PartialQueryMask}
