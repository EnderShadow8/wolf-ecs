import {expect} from "chai"

import {Query} from "../build/query"

describe("Query", function() {
  describe("constructor", function() {
    it("should have appropriate mask", function() {
      expect(new Query().mask).to.eql([])
      expect(new Query([[[3, 1, 4], [2, 6, 5]]]).mask).to.eql([[new Uint32Array([26]), new Uint32Array([100])]])
      expect(new Query([[[1, 2], [4]], [[0, 3, 5], []]]).mask).to.eql([
        [new Uint32Array([6]), new Uint32Array([16])],
        [new Uint32Array([41]), new Uint32Array([0])],
      ])
    })
  })

  describe("match", function() {
    it("should match empty", function() {
      const query = new Query().mask
      for(let i = 0; i < 20; i++) {
        expect(Query.match(new Uint32Array([Math.floor(Math.random() * 1000)]), query)).to.be.true
      }
    })

    it("should match AND", function() {
      const query = new Query([[[0, 2, 3], []]]).mask
      expect(Query.match(new Uint32Array([13]), query)).to.be.true
      expect(Query.match(new Uint32Array([14]), query)).to.be.false
      expect(Query.match(new Uint32Array([15]), query)).to.be.true
      expect(Query.match(new Uint32Array([16]), query)).to.be.false
    })

    it("should match NOT", function() {
      const query = new Query([[[0, 2], [1]]]).mask
      expect(Query.match(new Uint32Array([5]), query)).to.be.true
      expect(Query.match(new Uint32Array([7]), query)).to.be.false
      expect(Query.match(new Uint32Array([13]), query)).to.be.true
      expect(Query.match(new Uint32Array([15]), query)).to.be.false
    })

    it("should match OR", function() {
      const query = new Query([[[0], [1]], [[2, 3], []], [[4, 5], []]]).mask
      expect(Query.match(new Uint32Array([13]), query)).to.be.false
      expect(Query.match(new Uint32Array([21]), query)).to.be.true
      expect(Query.match(new Uint32Array([25]), query)).to.be.true
      expect(Query.match(new Uint32Array([30]), query)).to.be.false
      expect(Query.match(new Uint32Array([37]), query)).to.be.true
      expect(Query.match(new Uint32Array([63]), query)).to.be.false
    })

    it("should match OR NOT", function() {
      const query = new Query([[[1], []], [[2], [0]]]).mask
      expect(Query.match(new Uint32Array([2]), query)).to.be.true
      expect(Query.match(new Uint32Array([3]), query)).to.be.false
      expect(Query.match(new Uint32Array([5]), query)).to.be.false
      expect(Query.match(new Uint32Array([6]), query)).to.be.true
      expect(Query.match(new Uint32Array([7]), query)).to.be.true
    })
  })
})
