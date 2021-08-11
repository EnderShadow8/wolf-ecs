import {expect} from "chai"

import {ECS, types, all, not, any} from "../build/index"
import {_componentData} from "../build/component"
import {Query} from "../build/query"

let ecs = new ECS()

describe("ECS", function() {
  beforeEach(function() {
    ecs = new ECS()
  })

  describe("defineComponent", function() {
    it("should initialise component pools as defined", function() {
      const single = ecs.defineComponent(types.u16)
      const compound = ecs.defineComponent({f32: types.f32, more: {f64: types.f64}})
      const custom = ecs.defineComponent({custom: types.custom(), init: types.custom(() => 123), any: types.any})
      const empty = ecs.defineComponent()
      expect(single).to.eql(new Uint16Array(ecs.MAX_ENTITIES))
      expect(compound.f32).to.eql(new Float32Array(ecs.MAX_ENTITIES))
      expect(compound.more.f64).to.eql(new Float64Array(ecs.MAX_ENTITIES))
      expect(custom.custom).to.be.instanceof(Array)
      expect(custom.init).to.eql(new Array(10000).fill(123))
      expect(custom.any).to.be.instanceof(Array)
      expect(empty).to.eql({})
    })

    it("should increment counters", function() {
      const cmp = ecs.defineComponent()
      expect(cmp[_componentData].id).to.equal(0)
      expect(ecs.cmpID).to.equal(1)
      const cmp2 = ecs.defineComponent(types.f32)
      expect(cmp2[_componentData].id).to.equal(1)
      expect(ecs.cmpID).to.equal(2)
    })

    it("should throw error if entity already created", function() {
      ecs.createEntity()
      expect(() => ecs.defineComponent()).to.throw()
    })
  })

  describe("createQuery", function() { // TODO
    it("should return a query equivalent to new Query", function() {
      const cmp = ecs.defineComponent()
      const cmps = []
      for(let i = 0; i < 32; i++) {
        cmps.push(ecs.defineComponent())
      }
      expect(ecs.createQuery(cmp)).to.eql(new Query(ecs, all(cmp)))
      expect(ecs.createQuery(not(cmp))).to.eql(new Query(ecs, all(not(cmp))))
      expect(ecs.createQuery(cmps[31])).to.eql(new Query(ecs, all(cmps[31])))
    })

    it("should have existing archetypes", function() {
      const cmp = ecs.defineComponent()
      const id = ecs.createEntity()
      ecs.addComponent(id, cmp)

      const hasq = ecs.createQuery(cmp)
      const notq = ecs.createQuery(not(cmp))

      expect(hasq.archetypes).to.eql([ecs._arch.get("1")])
      expect(notq.archetypes).to.eql([ecs._arch.get("0")])
    })

    it("should throw error on invalid component", function() {
      expect(() => ecs.createQuery(123)).to.throw()
      expect(() => ecs.createQuery(123)).to.throw()
      expect(() => ecs.createQuery("abc")).to.throw()
      expect(() => ecs.createQuery(undefined)).to.throw()
      expect(() => ecs.createQuery({})).to.throw()
    })

    it("should throw error on other ecs component", function() {
      const ecs2 = new ECS()
      const cmp2 = ecs2.defineComponent()
      expect(() => ecs.createQuery(cmp2)).to.throw()
    })
  })

  describe("_validID", function() {
    it("should return true on valid ID", function() {
      ecs.createEntity()
      ecs.createEntity()
      ecs.createEntity()
      ecs.destroyEntity(1)
      expect(ecs._validID(0)).to.be.true
      expect(ecs._validID(2)).to.be.true
    })

    it("should return false on invalid ID", function() {
      ecs.createEntity()
      ecs.createEntity()
      ecs.createEntity()
      ecs.destroyEntity(1)
      expect(ecs._validID(1)).to.be.false
      expect(ecs._validID(3)).to.be.false
    })
  })

  describe("createEntity / destroyEntity", function() {
    it("should allocate and recycle IDs", function() {
      const id1 = ecs.createEntity()
      ecs.destroyEntity(id1)
      expect(ecs._rm.packed[0]).to.equal(id1)
      expect(ecs._rm.packed.length).to.equal(1)
      console.log(ecs._rm)
      const id2 = ecs.createEntity()
      expect(ecs._rm.packed.length).to.equal(0)
      const id3 = ecs.createEntity()
      ecs.destroyEntity(id2)
      ecs.destroyEntity(id3)
      expect([id2, id3]).to.include(id1)
      expect(Array.from(ecs._rm.packed.slice(0, ecs._rm.packed.length))).to.have.members([id2, id3])
    })

    it("should update archetypes", function() {
      const cmp = ecs.defineComponent()
      const id1 = ecs.createEntity()
      expect(ecs._empty).to.equal(ecs._arch.get("0"))
      const id2 = ecs.createEntity()
      expect(ecs._empty.has(id1)).to.be.true
      expect(ecs._empty.has(id2)).to.be.true
      ecs.addComponent(id1, cmp)
      ecs.destroyEntity(id1)
      ecs.destroyEntity(id2)
      expect(ecs._empty.has(id1)).to.be.false
      expect(ecs._arch.get("1").has(id1)).to.be.false
      expect(ecs._empty.has(id2)).to.be.false
    })

    it("should set _empty to the empty archetype", function() {
      ecs.defineComponent()
      ecs.createEntity()
      expect(ecs._empty).to.equal(ecs._arch.get("0"))
    })

    it("should set _empty to the empty archetype (n > 32)", function() {
      for(let i = 0; i < 40; i++) {
        ecs.defineComponent()
      }
      ecs.createEntity()
      expect(ecs._empty).to.equal(ecs._arch.get("0,0"))
    })

    it("should defer deletion", function() {
      ecs.createEntity()
      ecs.createEntity()
      ecs.createEntity()
      expect(ecs._rm.packed.length).to.equal(0)
      ecs.destroyEntity(0, true)
      ecs.destroyEntity(2, true)
      expect(ecs._rm.packed.length).to.equal(0)
      ecs.destroyPending()
      expect(Array.from(ecs._rm.packed)).to.have.members([0, 2])
    })

    it("should throw on max entity limit", function() {
      for(let i = 0; i < ecs.MAX_ENTITIES; i++) {
        ecs.createEntity()
      }
      expect(() => ecs.createEntity()).to.throw()
    })
  })

  describe("addComponent / removeComponent", function() {
    it("should update archetypes", function() {
      function arches(...arch) {
        return arch.map(i => ecs._arch.get(i))
      }

      const cmp1 = ecs.defineComponent()
      const cmp2 = ecs.defineComponent()
      const id = ecs.createEntity()
      const q1 = ecs.createQuery(cmp1)
      const q2 = ecs.createQuery(cmp1, not(cmp2))

      ecs.addComponent(id, cmp1)
      expect(ecs._arch.get("0").has(id)).to.be.false
      expect(ecs._arch.get("1").has(id)).to.be.true
      expect(q1.archetypes).to.have.members(arches("1"))
      expect(q2.archetypes).to.have.members(arches("1"))

      ecs.addComponent(id, cmp2)
      expect(arches("0", "1").map(i => i.has(id))).to.not.include(true)
      expect(ecs._arch.get("3").has(id)).to.be.true

      ecs.removeComponent(id, cmp1)
      expect(arches("0", "1", "3").map(i => i.has(id))).to.not.include(true)
      expect(ecs._arch.get("2").has(id)).to.be.true
      expect(q1.archetypes).to.have.members(arches("1", "3"))
      expect(q2.archetypes).to.have.members(arches("1"))

      ecs.removeComponent(id, cmp2)
      expect(arches("1", "2", "3").map(i => i.has(id))).to.not.include(true)
      expect(ecs._arch.get("0").has(id)).to.be.true
    })

    it("should throw error on invalid component", function() {
      const id = ecs.createEntity()
      expect(() => ecs.addComponent(id, 123)).to.throw()
      expect(() => ecs.removeComponent(id, "abc")).to.throw()
      expect(() => ecs.addComponent(id, undefined, true)).to.throw()
      expect(() => ecs.removeComponent(id, {}, true)).to.throw()
    })

    it("should throw error on invalid ID", function() {
      const cmp = ecs.defineComponent()
      ecs.createEntity()
      expect(() => ecs.addComponent(-1, cmp)).to.throw()
      expect(() => ecs.removeComponent("abc", cmp)).to.throw()
      expect(() => ecs.addComponent(undefined, cmp, true)).to.throw()
      expect(() => ecs.removeComponent({}, cmp, true)).to.throw()
    })

    it("should defer update", function() {
      const cmp = ecs.defineComponent()
      ecs.createEntity()
      ecs.createEntity()
      ecs.createEntity()
      ecs.addComponent(0, cmp, true)
      ecs.addComponent(1, cmp, true)
      expect(ecs._arch.size).to.equal(1)
      ecs.updatePending()
      expect(ecs._arch.size).to.equal(2)
      ecs.removeComponent(0, cmp, true)
      ecs.removeComponent(2, cmp, true)
      expect(ecs._ent[0]).to.equal(ecs._arch.get("1"))
      ecs.updatePending()
      expect(ecs._ent[0]).to.equal(ecs._empty)
      expect(ecs._ent[2]).to.equal(ecs._empty)
    })
  })
})
