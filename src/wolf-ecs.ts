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

// Systems
class System {
  ecs: ECS
  func: () => void

  constructor(ecs: ECS, func: () => void) {
    this.ecs = ecs
    this.func = func
  }

  execute() {
    this.ecs._clean()
    this.func()
  }
}

// Queries
type QueryMask = [Uint32Array, Uint32Array]

class Query {
  mask: QueryMask
  entities: number[] = []
  keys: number[] = []

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
class ECS {
  protected _dex: {[cmp: string]: number} = {}
  protected _ent: Uint32Array[] = []
  protected _queries: Query[] = []
  protected _dirty: number[] = []
  protected _dirtykeys: boolean[] = []
  protected _rm: number[] = []
  protected _ncmp = 0
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
    this._ncmp++
    return this
  }

  protected _crMask() {
    return new Uint32Array(Math.ceil(this._ncmp / 32))
  }

  createQuery(...types: string[]): Query {
    if(!types.length) {
      throw new Error("Query cannot be empty.")
    }
    const has = types.filter(c => c[0] !== "!")
    const not = types.filter(c => c[0] === "!").map(c => c.slice(1))
    const hasq = this._crMask()
    const notq = this._crMask()
    has.forEach((c, i) => {hasq[Math.floor(i / 32)] |= 1 << this._dex[c] % 32})
    not.forEach((c, i) => {notq[Math.floor(i / 32)] |= 1 << this._dex[c] % 32})
    const query = new Query([hasq, notq])
    this._queries.push(query)
    return query
  }

  defineSystem(func: () => void) {
    return new System(this, func)
  }

  createEntity(): number {
    if(this._rm.length) {
      const id = this._rm.pop()!
      this._crEnt(id)
      return id
    } else {
      this._crEnt(this.entID)
      return this.entID++
    }
  }

  protected _crEnt(id: number) {
    this._ent[id] = this._crMask()
    this._setDirty(id)
  }

  destroyEntity(id: number) {
    delete this._ent[id]
    this._setDirty(id)
    this._rm.push(id)
  }

  addComponent(id: number, type: string) {
    const i = this._dex[type]
    this._ent[id][Math.floor(i / 32)] |= 1 << i % 32
    this._setDirty(id)
    return this
  }

  removeComponent(id: number, type: string) {
    const i = this._dex[type]
    this._ent[id][Math.floor(i / 32)] &= ~(1 << i % 32)
    this._setDirty(id)
    return this
  }

  protected _setDirty(id: number) {
    if(!this._dirtykeys[id]) {
      this._dirty.push(id)
      this._dirtykeys[id] = true
    }
  }

  _clean() {
    for(let id of this._dirty) {
      for(let q of this._queries) {
        const m = this._ent[id] && match(this._ent[id], q.mask)
        if(m && !q.keys[id]) {
          q.keys[id] = q.entities.length
          q.entities.push(id)
        }
        if(!m && q.entities[q.keys[id]] === id) {
          if(q.entities.length > 1) {
            const last = q.entities.pop()!
            q.entities[q.keys[id]] = last
            q.keys[last] = q.keys[id]
          } else {
            q.entities = []
          }
          delete q.keys[id]
        }
      }
    }
    this._dirty = []
    this._dirtykeys = []
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
