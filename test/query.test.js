import {expect} from "chai"

import {all, not, any, Query} from "../build/query"
import {_componentData} from "../build/component"

const ecs = {} // Stub ECS
let cmps = []

describe("Query", function() {
  beforeEach(function() {
    for(let i = 0; i < 33; i++) {
      cmps.push({[_componentData]: {ecs, id: i}})
    }
  })

  describe("[modifiers]", function() {
    it("should throw on empty", function() {
      expect(() => {all()}).to.throw()
      expect(() => {any()}).to.throw()
    })
  })

  describe("match", function() {
    it("should match empty", function() {
      const query = new Query(ecs).mask
      for(let i = 0; i < 20; i++) {
        expect(Query.match(new Uint32Array([Math.floor(Math.random() * 1000)]), query)).to.be.true
      }
    })

    it("should match ALL", function() {
      const query = new Query(ecs, all(cmps[0], cmps[2], cmps[3])).mask
      expect(Query.match(new Uint32Array([13]), query)).to.be.true
      expect(Query.match(new Uint32Array([14]), query)).to.be.false
      expect(Query.match(new Uint32Array([15, 0]), query)).to.be.true
      expect(Query.match(new Uint32Array([16, 0]), query)).to.be.false
    })

    it("should match NOT", function() {
      const query = new Query(ecs, not(cmps[1])).mask
      expect(Query.match(new Uint32Array(), query)).to.be.true
      expect(Query.match(new Uint32Array([5]), query)).to.be.true
      expect(Query.match(new Uint32Array([7]), query)).to.be.false
      expect(Query.match(new Uint32Array([13, 4]), query)).to.be.true
      expect(Query.match(new Uint32Array([15, 0]), query)).to.be.false
    })

    it("should match ANY", function() {
      const query = new Query(ecs, any(cmps[0], cmps[2], cmps[5])).mask
      expect(Query.match(new Uint32Array(), query)).to.be.false
      expect(Query.match(new Uint32Array([10]), query)).to.be.false
      expect(Query.match(new Uint32Array([13]), query)).to.be.true
      expect(Query.match(new Uint32Array([15, 5]), query)).to.be.true
      expect(Query.match(new Uint32Array([16, 0]), query)).to.be.false
    })

    it("should match >32", function() {
      const query = new Query(ecs, all(cmps[0], cmps[32])).mask
      expect(Query.match(new Uint32Array([1, 1]), query)).to.be.true
      expect(Query.match(new Uint32Array([1, 2, 1]), query)).to.be.false
      expect(Query.match(new Uint32Array([3, 3, 0]), query)).to.be.true
      expect(Query.match(new Uint32Array([1]), query)).to.be.false
      expect(Query.match(new Uint32Array([0, 1]), query)).to.be.false
    })

    it("complex query #1", function() {
      const query = new Query(ecs, all(cmps[1], any(cmps[2], not(cmps[0])))).mask
      expect(Query.match(new Uint32Array([2]), query)).to.be.true
      expect(Query.match(new Uint32Array([3]), query)).to.be.false
      expect(Query.match(new Uint32Array([5, 0]), query)).to.be.false
      expect(Query.match(new Uint32Array([6, 1]), query)).to.be.true
      expect(Query.match(new Uint32Array([7, 43]), query)).to.be.true
    })

    it("complex query #2", function() {
      const query = new Query(ecs, all(not(any(cmps[0], cmps[1])), cmps[3])).mask
      expect(Query.match(new Uint32Array([1]), query)).to.be.false
      expect(Query.match(new Uint32Array([8]), query)).to.be.true
      expect(Query.match(new Uint32Array([9, 0]), query)).to.be.false
      expect(Query.match(new Uint32Array([10, 10]), query)).to.be.false
      expect(Query.match(new Uint32Array([12, 2]), query)).to.be.true
    })

    it("complex query #3", function() {
      const query = new Query(ecs, all(any(cmps[0], cmps[3]), any(cmps[2], not(cmps[4])))).mask
      expect(Query.match(new Uint32Array([1]), query)).to.be.true
      expect(Query.match(new Uint32Array([2]), query)).to.be.false
      expect(Query.match(new Uint32Array([8, 0]), query)).to.be.true
      expect(Query.match(new Uint32Array([17, 1]), query)).to.be.false
      expect(Query.match(new Uint32Array([21, 9]), query)).to.be.true
      expect(Query.match(new Uint32Array([29, 16]), query)).to.be.true
    })
  })
})
