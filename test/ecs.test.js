/// <reference path="../node_modules/@types/mocha/index.d.ts"/>
import {ECS, types} from "../dist/wolf-ecs.js"
import {expect} from "chai"

let ecs = new ECS()

describe("ECS", function() {
  beforeEach(function() {
    ecs = new ECS()
  })

  describe("defineComponent", function() {
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

    it("should throw an error if entity already created", function() {
      ecs.createEntity()
      expect(() => ecs.defineComponent("wrong", types.u32)).to.throw()
    })

    it("should throw an error if query already created", function() {
      ecs.defineComponent("cmp")
      ecs.createQuery("cmp")
      expect(() => ecs.defineComponent("wrong", types.u32)).to.throw()
    })

    it("should throw an error on duplicate names", function() {
      ecs.defineComponent("wrong", types.u32)
      expect(() => ecs.defineComponent("wrong", types.u32)).to.throw()
    })
  })

  describe("createQuery", function() {
    it("should return a query with correct mask", function() {
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

    it("should throw an error on no arguments", function() {
      expect(() => ecs.createQuery()).to.throw()
    })

    it("should throw an error on invalid name", function() {
      ecs.defineComponent("right")
      expect(() => ecs.createQuery("wrong")).to.throw()
    })
  })

  describe("createEntity", function() {
    it("should increment the ID counter", function() {
      expect(ecs.createEntity()).to.equal(0)
      expect(ecs.createEntity()).to.equal(1)
      expect(ecs.createEntity()).to.equal(2)
    })

    it("should use and remove recycled IDs from _rm", function() {
      const id1 = ecs.createEntity()
      const id2 = ecs.createEntity()
      ecs.destroyEntity(id1)
      ecs.destroyEntity(id2)

      const id = ecs.createEntity()
      expect([0, 1]).to.include(id)
      expect(ecs._rm).to.not.include(id)
    })

    it("should set _empty to the empty archetype", function() {
      ecs.defineComponent("cmp")
      ecs.createEntity()
      expect(ecs._empty).to.equal(ecs._arch.get("0"))
    })

    it("should set _empty to the empty archetype (n > 32)", function() {
      for(let i = 0; i < 40; i++) {
        ecs.defineComponent(i.toString())
      }
      ecs.createEntity()
      expect(ecs._empty).to.equal(ecs._arch.get("0,0"))
    })
  })

  describe("destroyEntity", function() {
    it("should add ID to _rm", function() {
      const id = ecs.createEntity()
      ecs.destroyEntity(id)
      expect(ecs._rm).to.have.members([0])

      const id1 = ecs.createEntity()
      const id2 = ecs.createEntity()
      ecs.destroyEntity(id1)
      ecs.destroyEntity(id2)
      expect(ecs._rm).to.have.members([0, 1])
    })

    it("should remove entity from all archetypes", function() {
      ecs.defineComponent("cmp")

      const id = ecs.createEntity()
      ecs.addComponent(id, "cmp")

      ecs.destroyEntity(id)
      expect(ecs._empty.has(id)).to.be.false
      expect(ecs._arch.get("1").has(id)).to.be.false
    })
  })

  describe("addComponent / removeComponent", function() {
    it("should update archetypes of entity and query", function() {
      function arches(...arch) {
        return arch.map(i => ecs._arch.get(i))
      }

      ecs.defineComponent("cmp1")
      ecs.defineComponent("cmp2")
      const id = ecs.createEntity()
      const q1 = ecs.createQuery("cmp1")
      const q2 = ecs.createQuery("cmp1", "!cmp2")

      ecs.addComponent(id, "cmp1")
      expect(ecs._arch.get("0").has(id)).to.be.false
      expect(ecs._arch.get("1").has(id)).to.be.true
      expect(q1.archetypes).to.have.members(arches("1"))
      expect(q2.archetypes).to.have.members(arches("1"))

      ecs.addComponent(id, "cmp2")
      expect(arches("0", "1").map(i => i.has(id))).to.not.contain(true)
      expect(ecs._arch.get("3").has(id)).to.be.true

      ecs.removeComponent(id, "cmp1")
      expect(arches("0", "1", "3").map(i => i.has(id))).to.not.contain(true)
      expect(ecs._arch.get("2").has(id)).to.be.true
      expect(q1.archetypes).to.have.members(arches("1", "3"))
      expect(q2.archetypes).to.have.members(arches("1"))

      ecs.removeComponent(id, "cmp2")
      expect(arches("1", "2", "3").map(i => i.has(id))).to.not.contain(true)
      expect(ecs._arch.get("0").has(id)).to.be.true
    })

    it("should throw an error on invalid name", function() {
      const id = ecs.createEntity()
      expect(() => ecs.addComponent(id, "wrong")).to.throw()
      expect(() => ecs.removeComponent(id, "wrong")).to.throw()
    })
  })
})
