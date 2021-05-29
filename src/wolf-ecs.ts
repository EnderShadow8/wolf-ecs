type TypedArrayConstructor = Int8ArrayConstructor | Uint8ArrayConstructor | Int16ArrayConstructor | Uint16ArrayConstructor | Int32ArrayConstructor | Uint32ArrayConstructor | Float32ArrayConstructor | Float64ArrayConstructor | BigInt64ArrayConstructor | BigUint64ArrayConstructor
type TypedArray = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array

// Components
type ComponentDef = Type | {[key: string]: ComponentDef}
type ComponentArray = TypedArray | {[name: string]: ComponentArray}

function createComponentArray(def: ComponentDef, len: number): ComponentArray {
  if(def instanceof Type) {
    return new def.arr(len)
  }
  const ret: ComponentArray = {}
  for(let i in def) {
    ret[i] = createComponentArray(def[i], len)
  }
  return ret
}

// Queries
type QueryMask = [Uint32Array, Uint32Array]

class Query {
  mask: QueryMask
  archetypes: Archetype[] = []

  constructor(mask: QueryMask) {
    this.mask = mask
  }
}

function match(target: Uint32Array, mask: QueryMask) {
  for(let i = 0; i < mask[0].length; i++) {
    if((target[i] & mask[0][i]) !== mask[0][i]) {
      return false
    }
  }
  for(let i = 0; i < mask[1].length; i++) {
    if((target[i] & mask[1][i]) > 0) {
      return false
    }
  }
  return true
}

// ECS
class Archetype {
  mask: Uint32Array
  entities: number[] = []
  keys: number[] = []
  change: Archetype[] = []

  constructor(mask: Uint32Array) {
    this.mask = mask
  }

  has(x: number) {
    return this.entities[this.keys[x]] === x
  }

  add(x: number) {
    if(!this.has(x)) {
      this.keys[x] = this.entities.length
      this.entities.push(x)
    }
  }

  remove(x: number) {
    if(this.has(x)) {
      if(this.entities.length === 1) {
        this.entities = []
      } else {
        const last = this.entities.pop()!
        this.keys[last] = this.keys[x]
        this.entities[this.keys[x]] = last
      }
    }
  }
}

class ECS {
  protected _arch: Map<string, Archetype> = new Map()
  protected _dex: {[cmp: string]: number} = {}
  protected _ent: Archetype[] = []
  protected _queries: Query[] = []
  protected _rm: number[] = []
  protected _empty: Archetype = new Archetype(new Uint32Array())
  protected _init = false
  protected cmpID = 0
  protected entID = 0
  components: {[name: string]: ComponentArray} = {}
  MAX_ENTITIES: number

  constructor(max: number = 1e4) {
    this.MAX_ENTITIES = max
  }

  defineComponent(name: string, def: ComponentDef = {}) {
    if(this._init) {
      throw new Error("Components can only be defined before entities are created.")
    }
    const cmp = createComponentArray(def, this.MAX_ENTITIES)
    this.components[name] = cmp
    this._dex[name] = this.cmpID++
    return this
  }

  protected _crMask() {
    return new Uint32Array(Math.ceil(this.cmpID / 32))
  }

  createQuery(...types: string[]): Query {
    this._init = true
    if(!types.length) {
      throw new Error("Query cannot be empty.")
    }
    const has = types.filter(c => c[0] !== "!")
    const not = types.filter(c => c[0] === "!").map(c => c.slice(1))
    const hasq = this._crMask()
    const notq = this._crMask()
    const updateMask = (cmps: string[], mask: Uint32Array) => {
      cmps.forEach(c => {
        const i = this._dex[c]
        if(i === undefined) {
          throw new Error("Invalid component name")
        }
        mask[Math.floor(i / 32)] |= 1 << i % 32
      })
    }
    updateMask(has, hasq)
    updateMask(not, notq)
    const query = new Query([hasq, notq])
    this._queries.push(query)
    return query
  }

  protected _getArch(mask: Uint32Array) {
    if(!this._arch.has(mask.toString())) {
      const arch = new Archetype(mask.slice())
      this._arch.set(mask.toString(), arch)
      for(let q of this._queries) {
        if(match(mask, q.mask)) {
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
    arch.remove(id)
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
    this._ent[id].add(id)
  }

  protected _crEnt(id: number) {
    this._ent[id] = this._empty
    this._empty.add(id)
  }

  createEntity(): number {
    if(this._rm.length) {
      const id = this._rm.pop()!
      this._crEnt(id)
      return id
    } else {
      if(!this.entID) {
        this._init = true
        this._empty.mask = this._crMask()
        this._arch.set(this._empty.mask.toString(), this._empty)
      }
      this._crEnt(this.entID)
      return this.entID++
    }
  }

  destroyEntity(id: number) {
    this._ent[id].remove(id)
    this._rm.push(id)
  }

  addComponent(id: number, type: string) {
    const i = this._dex[type]
    if(!this._hasComponent(this._ent[id].mask, i)) {
      this._archChange(id, i)
    }
    return this
  }

  removeComponent(id: number, type: string) {
    const i = this._dex[type]
    if(this._hasComponent(this._ent[id].mask, i)) {
      this._archChange(id, i)
    }
    return this
  }
}

// Types
class Type {
  arr: TypedArrayConstructor
  constructor(arr: TypedArrayConstructor) {
    this.arr = arr
  }
}

const types: {[type: string]: Type} = {}
types.int8 = types.i8 = types.char = new Type(Int8Array)
types.uint8 = types.u8 = types.uchar = new Type(Uint8Array)
types.int16 = types.i16 = types.short = new Type(Int16Array)
types.uint16 = types.u16 = types.ushort = new Type(Uint16Array)
types.int32 = types.i32 = types.int = new Type(Int32Array)
types.uint32 = types.u32 = types.uint = new Type(Uint32Array)
types.float32 = types.f32 = types.float = new Type(Float32Array)
types.float64 = types.f64 = types.double = new Type(Float64Array)
types.bigint64 = types.int64 = types.i64 = types.long = new Type(BigInt64Array)
types.biguint64 = types.uint64 = types.u64 = types.ulong = new Type(BigUint64Array)

export {ECS, types}
