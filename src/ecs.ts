import {_componentData, createComponentArray, Tree, Type, ComponentArray} from "./component"
import {all, Query, RawQuery} from "./query"
import {SparseSet, Archetype} from "./sparseset"

class ECS {
  protected _arch: Map<string, Archetype> = new Map()
  protected _ent: Archetype[] = []
  protected _queries: Query[] = []
  protected _destroy: SparseSet
  protected _mcmp: {addrm: boolean[], ent: number[], cmp: number[]} = {addrm: [], ent: [], cmp: []}
  protected _rm: SparseSet
  protected _empty: Archetype
  protected cmpID = 0
  protected entID = 0
  readonly MAX_ENTITIES
  readonly DEFAULT_DEFER

  constructor(max = 1e4, defer = false) {
    this.MAX_ENTITIES = max
    this.DEFAULT_DEFER = defer
    this._destroy = new SparseSet()
    this._rm = new SparseSet()
    this._empty = new Archetype(new Uint32Array())
  }

  defineComponent<T extends Tree<Type>>(def: T): ComponentArray<T>
  defineComponent(): {}
  defineComponent(def: Tree<Type> = {}) {
    if(this.entID) {
      throw new Error("cannot define component after entity creation")
    }
    return this.registerComponent(createComponentArray(def, this.MAX_ENTITIES))
  }

  registerComponent<T>(cmp: T): T {
    return Object.assign(cmp, {[_componentData]: {ecs: this, id: this.cmpID++}})
  }

  protected _initEmpty() {
    this._empty.mask = new Uint32Array(Math.ceil(this.cmpID / 32))
    this._arch.set(this._empty.mask.toString(), this._empty)
  }

  createQuery(...raw: RawQuery[]): Query {
    const query = new Query(this, all(...raw))
    this._arch.forEach(i => {if(Query.match(i.mask, query.mask)) {query.archetypes.push(i)}})
    this._queries.push(query)
    return query
  }

  protected _validID(id: unknown) {
    if(typeof id !== "number") {
      return false
    }
    return !(this._rm.has(id) || this.entID <= id)
  }

  protected _getArch(mask: Uint32Array) {
    if(!this._arch.has(mask.toString())) {
      const arch = new Archetype(mask.slice())
      this._arch.set(mask.toString(), arch)
      for(let q of this._queries) {
        if(Query.match(mask, q.mask)) {
          q.archetypes.push(arch)
        }
      }
    }
    return this._arch.get(mask.toString())!
  }

  protected _hasComponent(mask: Uint32Array, i: number) {
    return mask[Math.floor(i / 32)] & (1 << i % 32)
  }

  protected _archChange(id: number, i: number) {
    const arch = this._ent[id]
    arch.sset.remove(id)
    if(!arch.change[i]) {
      if(this._hasComponent(arch.mask, i)) {
        arch.mask[Math.floor(i / 32)] &= ~(1 << i % 32)
        arch.change[i] = this._getArch(arch.mask)
        arch.mask[Math.floor(i / 32)] |= 1 << i % 32
      } else {
        arch.mask[Math.floor(i / 32)] |= 1 << i % 32
        arch.change[i] = this._getArch(arch.mask)
        arch.mask[Math.floor(i / 32)] &= ~(1 << i % 32)
      }
    }
    this._ent[id] = arch.change[i]
    this._ent[id].sset.add(id)
  }

  protected _crEnt(id: number) {
    this._ent[id] = this._empty
    this._empty.sset.add(id)
  }

  createEntity(): number {
    if(this._rm.packed.length) {
      const id = this._rm.packed.pop()!
      this._crEnt(id)
      return id
    } else {
      if(!this.entID) {
        this._initEmpty()
      }
      if(this.entID === this.MAX_ENTITIES) {
        throw new Error("maximum entity limit reached")
      }
      this._crEnt(this.entID)
      return this.entID++
    }
  }

  destroyEntity(id: number, defer = this.DEFAULT_DEFER) {
    if(defer) {
      this._destroy.add(id)
    } else {
      this._ent[id].sset.remove(id)
      this._destroy.remove(id)
      this._rm.add(id)
    }
  }

  destroyPending() {
    while(this._destroy.packed.length > 0) {
      this.destroyEntity(this._destroy.packed[0])
    }
    this._destroy.packed.length = 0
  }

  protected _addcmp(id: number, cmp: number) {
    if(!this._hasComponent(this._ent[id].mask, cmp)) {
      this._archChange(id, cmp)
    }
  }

  addComponent(id: number, cmp: ComponentArray, defer = this.DEFAULT_DEFER) {
    if(!this._validID(id)) {
      throw new Error("invalid entity id")
    }
    const i = (cmp as any)[_componentData].id
    if(defer) {
      this._mcmp.addrm.push(true)
      this._mcmp.ent.push(id)
      this._mcmp.cmp.push(i)
    } else {
      this._addcmp(id, i)
    }
    return this
  }

  protected _rmcmp(id: number, cmp: number) {
    if(this._hasComponent(this._ent[id].mask, cmp)) {
      this._archChange(id, cmp)
    }
  }

  removeComponent(id: number, cmp: ComponentArray, defer = this.DEFAULT_DEFER) {
    if(!this._validID(id)) {
      throw new Error("invalid entity id")
    }
    const i = (cmp as any)[_componentData].id
    if(defer) {
      this._mcmp.addrm.push(false)
      this._mcmp.ent.push(id)
      this._mcmp.cmp.push(i)
    } else {
      this._rmcmp(id, i)
    }
    return this
  }

  updatePending() {
    for(let i = this._mcmp.addrm.length - 1; i >= 0; i--) {
      if(this._validID(this._mcmp.ent[i])) {
        if(this._mcmp.addrm[i]) {
          this._addcmp(this._mcmp.ent[i], this._mcmp.cmp[i])
        } else {
          this._rmcmp(this._mcmp.ent[i], this._mcmp.cmp[i])
        }
      }
    }
    this._mcmp = {addrm: [], ent: [], cmp: []}
  }
}

export {ECS}
