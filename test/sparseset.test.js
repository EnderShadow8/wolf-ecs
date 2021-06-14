import {expect} from "chai"

import {has, add, remove} from "../build/sparseset"

class SparseSet {
  sparse = []
  packed = []

  has(x) {
    return has(this.sparse, this.packed, x)
  }

  add(x) {
    add(this.sparse, this.packed, x)
  }

  remove(x) {
    remove(this.sparse, this.packed, x)
  }
}

let sset = new SparseSet()
let set = new Set() // Ground truth

describe("SparseSet", function() {
  beforeEach(function() {
    sset = new SparseSet()
    set.clear()
  })

  for(let i = 0; i < 3; i++) {
    it(`should behave the same as Set (run #${i + 1})`, function() {
      for(let i = 0; i < 1000; i++) {
        if(Math.random() > 0.5) {
          const n = Math.floor(Math.random() * 100)
          sset.add(n)
          set.add(n)
        } else {
          const n = Math.floor(Math.random() * 100)
          sset.remove(n)
          set.delete(n)
        }
      }
      expect(sset.packed).to.have.members(Array.from(set))
      for(let i = 0; i < 100; i++) {
        expect(sset.has(i)).to.equal(set.has(i))
      }
    })
  }
})
