/// <reference path="../node_modules/@types/mocha/index.d.ts"/>
import {ECS, types} from "../dist/wolf-ecs.js"
import {expect} from "chai"

let ecs = new ECS()

describe("ECS", function() {
  beforeEach(function() {
    ecs = new ECS()
  })

  describe("#defineComponent", function() {
    it("should initialise component pools as defined", function() {
      ecs.defineComponent("u16", types.u16)
      ecs.defineComponent("compound", {f32: types.f32, more: {f64: types.f64}})
      ecs.defineComponent("empty")

      expect(ecs.components.u16).to.be.instanceof(Uint16Array)
      expect(ecs.components.compound.f32).to.be.instanceof(Float32Array)
      expect(ecs.components.compound.more.f64).to.be.instanceof(Float64Array)
      expect(JSON.stringify(ecs.components.empty)).to.equal("{}")
    })

    it("should increment counters", function() {
      ecs.defineComponent("u16", types.u16)
      expect(ecs.cmpID).to.equal(1)
      expect(ecs._dex.u16).to.equal(0)

      ecs.defineComponent("u32", types.u32)
      expect(ecs.cmpID).to.equal(2)
      expect(ecs._dex.u32).to.equal(1)
    })

    it("should throw an error if _init === true", function() {
      ecs._init = true
      expect(() => {ecs.defineComponent("wrong", types.u32)}).to.throw()
    })
  })

  describe("#createQuery", function() {
    it("should return a query with appropriate mask", function() {
      ecs.defineComponent("cmp")
      for(let i = 0; i < 32; i++) {
        ecs.defineComponent(i.toString())
      }

      const has = ecs.createQuery("cmp").mask[0]
      const not = ecs.createQuery("!cmp").mask[1]
      const query = ecs.createQuery("31")

      expect(has[0]).to.equal(1)
      expect(not[0]).to.equal(1)
      expect(query.mask[0][0]).to.equal(0)
      expect(query.mask[0][1]).to.equal(1)
    })

    it("should set _init to true", function() {
      ecs.defineComponent("cmp")
      ecs.createQuery("cmp")
      expect(ecs._init).to.be.true
    })

    it("should throw an error on no arguments", function() {
      expect(() => {ecs.createQuery()}).to.throw()
    })

    it("should throw an error on invalid names", function() {
      ecs.defineComponent("right")
      expect(() => {ecs.createQuery("wrong")}).to.throw()
    })
  })
})
