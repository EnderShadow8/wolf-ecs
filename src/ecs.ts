import {_componentData, createComponentArray, Tree, Type, ComponentArray} from "./component"
import {all, Query, RawQuery} from "./query"
import {SparseSet, Archetype} from "./sparseset"

class ECS {
  protected _arch: Map<string, Archetype> = new Map()
  protected _queries: Query[] = []
  protected _ent: Archetype[] = []
  protected _updateTo: Archetype[] = []
  protected _toUpdate = new SparseSet()
  protected _toDestroy = new SparseSet()
  protected _rm = new SparseSet()
  protected _empty = new Archetype(new Uint32Array())
  protected cmpID = 0
  protected entID = 0
  readonly MAX_ENTITIES
  readonly DEFAULT_DEFER

  constructor(max = 1e4, defer = false) {
    this.MAX_ENTITIES = max
    this.DEFAULT_DEFER = defer
  }

  bind(): Pick<ECS, Exclude<{[K in keyof ECS]: ECS[K] extends Function ? K : never}[keyof ECS], "bind">> {
    const proto = ECS.prototype
    const ret: any = {}
    for(let i of Object.getOwnPropertyNames(proto) as (keyof ECS)[]) {
      if(typeof proto[i] === "function" && i !== "bind") {
        ret[i] = (proto[i] as any).bind(this)
      }
    }
    return ret
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
    return mask[~~(i / 32)] & (1 << i % 32)
  }

  protected _archChange(arch: Archetype, i: number) {
    if(!arch.change[i]) {
      arch.mask[~~(i / 32)] ^= 1 << i % 32
      arch.change[i] = this._getArch(arch.mask)
      arch.mask[~~(i / 32)] ^= 1 << i % 32
    }
    return arch.change[i]
  }

  protected _crEnt(id: number) {
    this._ent[id] = this._updateTo[id] = this._empty
    this._empty.sset.add(id)
  }

  createEntity(): number {
    if(this._rm.packed.length) {
      const id = this._rm.packed.pop()!
      this._crEnt(id)
      return id
    } else {
      if(!this.entID) {
        this._empty.mask = new Uint32Array(Math.ceil(this.cmpID / 32))
        this._arch.set(this._empty.mask.toString(), this._empty)
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
      this._toDestroy.add(id)
    } else {
      this._ent[id].sset.remove(id)
      this._toDestroy.remove(id)
      this._rm.add(id)
    }
  }

  destroyPending() {
    while(this._toDestroy.packed.length > 0) {
      this.destroyEntity(this._toDestroy.packed[0])
    }
    this._toDestroy.packed.length = 0
  }

  addComponent(id: number, cmp: ComponentArray, defer = this.DEFAULT_DEFER) {
    if(!this._validID(id)) {
      throw new Error("invalid entity id")
    }
    const i = (cmp as any)[_componentData].id
    if(defer) {
      this._toUpdate.add(id)
    } else {
      if(!this._hasComponent(this._ent[id].mask, i)) {
        this._ent[id].sset.remove(id)
        this._ent[id] = this._archChange(this._ent[id], i)
        this._ent[id].sset.add(id)
      }
    }
    if(!this._hasComponent(this._updateTo[id].mask, i)) {
      this._updateTo[id] = this._archChange(this._updateTo[id], i)
    }
    return this
  }

  removeComponent(id: number, cmp: ComponentArray, defer = this.DEFAULT_DEFER) {
    if(!this._validID(id)) {
      throw new Error("invalid entity id")
    }
    const i = (cmp as any)[_componentData].id
    if(defer) {
      this._toUpdate.add(id)
    } else {
      if(this._hasComponent(this._ent[id].mask, i)) {
        this._ent[id].sset.remove(id)
        this._ent[id] = this._archChange(this._ent[id], i)
        this._ent[id].sset.add(id)
      }
    }
    if(this._hasComponent(this._updateTo[id].mask, i)) {
      this._updateTo[id] = this._archChange(this._updateTo[id], i)
    }
    return this
  }

  updatePending() {
    const arr = this._toUpdate.packed
    for(let i = 0; i < arr.length; i++) {
      const id = arr[i]
      if(this._validID(id)) {
        this._ent[id].sset.remove(id)
        this._ent[id] = this._updateTo[id]
        this._ent[id].sset.add(id)
      }
    }
    this._toUpdate.packed = []
  }
}

export {ECS}
