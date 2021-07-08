import {expect} from "chai"

import {SparseSet} from "../build/sparseset"

let sset = new SparseSet(1000)
let set = new Set() // Ground truth

describe("SparseSet", function() {
  beforeEach(function() {
    sset.packed.length = 0
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
      expect(Array.from(sset.packed.slice(0, sset.length))).to.have.members(Array.from(set))
      for(let i = 0; i < 100; i++) {
        expect(sset.has(i)).to.equal(set.has(i))
      }
    })
  }
})
