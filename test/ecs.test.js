import {ECS, types} from "../dist/wolf-ecs.js"
import {expect} from "chai"

let ecs = new ECS()

describe("ECS", function() {
  beforeEach(function() {
    ecs = new ECS()
  })

  it("should set MAX_ENTITIES to 1e4", function() {
    ecs = new ECS(1e4)
    expect(ecs.MAX_ENTITIES).to.equal(1e4)
  })

  describe("defineComponent", function() {
    it("should initialise component pools as defined", function() {
      ecs.defineComponent("u16", types.u16)
      ecs.defineComponent("compound", {f32: types.f32, more: {f64: types.f64}})
      ecs.defineComponent("empty")
      expect(ecs.components.u16).to.be.instanceof(Uint16Array)
      expect(ecs.components.compound.f32).to.be.instanceof(Float32Array)
      expect(ecs.components.compound.more.f64).to.be.instanceof(Float64Array)
      expect(ecs.components.empty).to.eql({})
    })

    it("should increment counters", function() {
      ecs.defineComponent("cmp")
      ecs.defineComponent("cmp2", types.f32)
      expect(ecs._dex.cmp).to.equal(0)
      expect(ecs._dex.cmp2).to.equal(1)
    })

    it("should throw error if entity already created", function() {
      ecs.createEntity()
      expect(() => ecs.defineComponent("wrong", types.u32)).to.throw()
    })

    it("should throw error on duplicate names", function() {
      ecs.defineComponent("wrong", types.u32)
      expect(() => ecs.defineComponent("wrong", types.u32)).to.throw()
    })

    it("should throw error on invalid names", function() {
      expect(() => ecs.defineComponent("", types.u32)).to.throw()
      expect(() => ecs.defineComponent("!")).to.throw()
      expect(() => ecs.defineComponent("a s d f")).to.throw()
      expect(() => ecs.defineComponent("k!k")).to.throw()
      expect(() => ecs.defineComponent("#$%^&*()")).to.throw()
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

    it("should have correct existing archetypes", function() {
      ecs.defineComponent("cmp")
      const id = ecs.createEntity()
      ecs.addComponent(id, "cmp")

      const has = ecs.createQuery("cmp")
      const not = ecs.createQuery("!cmp")

      expect(has.archetypes).to.eql([ecs._arch.get("1")])
      expect(not.archetypes).to.eql([ecs._arch.get("0")])
    })

    it("should throw error on no arguments", function() {
      expect(() => ecs.createQuery()).to.throw()
    })

    it("should throw error on invalid name", function() {
      ecs.defineComponent("right")
      expect(() => ecs.createQuery("wrong")).to.throw()
    })
  })

  describe("createEntity / destroyEntity", function() {
    it("should aloocate and recycle IDs", function() {
      const id1 = ecs.createEntity()
      ecs.destroyEntity(id1)
      expect(ecs._rm).to.have.members([id1])
      const id2 = ecs.createEntity()
      expect(ecs._rm).to.eql([])
      const id3 = ecs.createEntity()
      ecs.destroyEntity(id2)
      ecs.destroyEntity(id3)
      expect([id2, id3]).to.include(id1)
      expect(ecs._rm).to.have.members([id2, id3])
    })

    it("should update archetypes", function() {
      ecs.defineComponent("cmp")
      const id1 = ecs.createEntity()
      expect(ecs._empty).to.equal(ecs._arch.get("0"))
      const id2 = ecs.createEntity()
      expect(ecs._empty.has(id1)).to.be.true
      expect(ecs._empty.has(id2)).to.be.true
      ecs.addComponent(id1, "cmp")
      ecs.destroyEntity(id1)
      ecs.destroyEntity(id2)
      expect(ecs._empty.has(id1)).to.be.false
      expect(ecs._arch.get("1").has(id1)).to.be.false
      expect(ecs._empty.has(id2)).to.be.false
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

  describe("addComponent / removeComponent", function() {
    it("should update archetypes", function() {
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
      expect(arches("0", "1").map(i => i.has(id))).to.not.include(true)
      expect(ecs._arch.get("3").has(id)).to.be.true

      ecs.removeComponent(id, "cmp1")
      expect(arches("0", "1", "3").map(i => i.has(id))).to.not.include(true)
      expect(ecs._arch.get("2").has(id)).to.be.true
      expect(q1.archetypes).to.have.members(arches("1", "3"))
      expect(q2.archetypes).to.have.members(arches("1"))

      ecs.removeComponent(id, "cmp2")
      expect(arches("1", "2", "3").map(i => i.has(id))).to.not.include(true)
      expect(ecs._arch.get("0").has(id)).to.be.true
    })

    it("should throw error on invalid name", function() {
      const id = ecs.createEntity()
      expect(() => ecs.addComponent(id, "wrong")).to.throw()
      expect(() => ecs.removeComponent(id, "wrong")).to.throw()
    })
  })

  describe("serialise / deserialise", function() {
    for(let i = 0; i < 5; i++) {
      it(`should produce effectively equal output (run #${i + 1})`, function() {
        ecs = new ECS(1000)
        ecs.defineComponent("cmp1")
        ecs.defineComponent("cmp2", types.f64)
        ecs.defineComponent("cmp3", {foo: types.u32, bar: types.i64})

        const ids = []
        for(let i = 0; i < 1000; i++) {
          const r = Math.random() * 5
          if(ids.length === 0 || r < 1) {
            ids.push(ecs.createEntity())
          } else if(r < 2) {
            const id = ids.splice(Math.random() * ids.length, 1)[0]
            ecs.destroyEntity(id)
          } else if(r < 3) {
            const id = ids[Math.floor(Math.random() * ids.length)]
            ecs.addComponent(id, "cmp1")
          } else if(r < 4) {
            const id = ids[Math.floor(Math.random() * ids.length)]
            ecs.addComponent(id, "cmp2")
            ecs.components.cmp2[id] = Math.random() * 1000
          } else if(r < 5) {
            const id = ids[Math.floor(Math.random() * ids.length)]
            ecs.addComponent(id, "cmp3")
            ecs.components.cmp3.foo[id] = Math.random() * 1000
            ecs.components.cmp3.bar[id] = BigInt(Math.floor(Math.random() * 1000))
          }
        }

        const ecs2 = new ECS(ecs.serialise())
        for(let i in ecs) {
          if(!["_arch", "_ent", "_queries", "_rmkeys", "_empty"].includes(i)) {
            expect(ecs[i]).to.eql(ecs2[i])
          }
        }
        let c = 0
        for(let i of ecs._arch) {
          if(i[1].entities.length || i[1] === ecs._empty) {
            expect(ecs2._arch.get(i[0]).entities).to.have.members(i[1].entities)
            c++
          }
        }
        expect(ecs2._empty).to.equal(ecs2._arch.get(ecs2._empty.mask.toString()))
        expect(ecs2._arch.size).to.equal(c)
        for(let i = 0; i < ecs._ent.length; i++) {
          if(ecs._ent[i].has(i)) {
            expect(ecs2._ent[i].mask).to.eql(ecs._ent[i].mask)
            expect(ecs2._ent[i].has(i)).to.be.true
          }
        }
        for(let i = 0; i < ecs._rmkeys.length; i++) {
          expect(!!ecs2._rmkeys[i]).to.equal(!!ecs._rmkeys[i])
        }
        expect(ecs2).to.eql(new ECS(JSON.stringify(ecs.serialise())))
      })
    }
  })
})
