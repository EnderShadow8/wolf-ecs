import {Query} from "./query"

function defineSystem(query: Query, func: (id: number) => void) {
  return function() {
    for(let i = 0, l = query.archetypes.length; i < l; i++) {
      const ent = query.archetypes[i].entities
      for(let j = ent.length; j > 0; j--) {
        func(ent[j - 1])
      }
    }
  }
}

export {defineSystem}
