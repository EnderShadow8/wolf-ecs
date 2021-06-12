import {expect} from "chai"

import {Archetype} from "../build/archetype.js"

let arch = new Archetype(new Uint32Array())
let set = new Set() // Ground truth

describe("Archetype", function() {
  beforeEach(function() {
    arch = new Archetype(new Uint32Array())
    set.clear()
  })

  for(let i = 0; i < 3; i++) {
    it(`should behave the same as Set (run #${i + 1})`, function() {
      for(let i = 0; i < 1000; i++) {
        if(Math.random() > 0.5) {
          const n = Math.floor(Math.random() * 100)
          arch.add(n)
          set.add(n)
        } else {
          const n = Math.floor(Math.random() * 100)
          arch.remove(n)
          set.delete(n)
        }
      }
      expect(arch.entities).to.have.members(Array.from(set))
      for(let i = 0; i < 100; i++) {
        expect(arch.has(i)).to.equal(set.has(i))
      }
    })
  }
})
