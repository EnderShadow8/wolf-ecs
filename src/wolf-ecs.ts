type TypedArrayConstructor = Int8ArrayConstructor | Uint8ArrayConstructor | Int16ArrayConstructor | Uint16ArrayConstructor | Int32ArrayConstructor | Uint32ArrayConstructor | Float32ArrayConstructor | Float64ArrayConstructor | BigInt64ArrayConstructor | BigUint64ArrayConstructor
type TypedArray = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array

// Components
const dex = Symbol()
type SoA = TypedArray | SoA[] | {[key: string]: SoA}
type ComponentDef = Type | {[key: string]: ComponentDef}
type ComponentArray = SoA & {[dex]: number}

function createSoA(def: ComponentDef, len: number): SoA {
  if(def instanceof Type) {
    return new def.arr(len)
  }
  if(def instanceof Array) {
    return new Array(def[1]).fill().map(() => createSoA(def[0], len))
  }
  const ret: SoA = {}
  for(let i in def) {
    ret[i] = createSoA(def[i], len)
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

class Not {
  cmp: ComponentArray

  constructor(cmp: ComponentArray) {
    this.cmp = cmp
  }
}

function not(cmp: ComponentArray) {
  return new Not(cmp)
}

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
  protected _cmp: ComponentArray[] = []
  protected _ent: Uint32Array[] = []
  protected _queries: Query[] = []
  protected _dirty: number[] = []
  protected _dirtykeys: boolean[] = []
  protected _rm: number[] = []
  protected _init = false
  protected cmpID = 0
  protected entID = 0
  MAX_ENTITIES: number

  constructor(max: number = 1e4) {
    this.MAX_ENTITIES = max
  }

  defineComponent(def: ComponentDef = {}): ComponentArray {
    if(this._init) {
      throw new Error("Components can only be defined before entities are created.")
    }
    const cmp = Object.assign(createSoA(def, this.MAX_ENTITIES), {[dex]: this.cmpID++})
    this._cmp.push(cmp)
    return cmp
  }

  createQuery(...types: ComponentArray[]): Query {
    if(!types.length) {
      throw new Error("Query cannot be empty.")
    }
    const has = types.filter(c => !(c instanceof Not))
    const not = types.filter(c => c instanceof Not)
    const hasq = new Uint32Array(Math.ceil(this._cmp.length / 32))
    const notq = new Uint32Array(Math.ceil(this._cmp.length / 32))
    has.forEach((c, i) => {hasq[Math.floor(i / 32)] |= 1 << c[dex] % 32})
    not.forEach((c, i) => {notq[Math.floor(i / 32)] |= 1 << c[dex] % 32})
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
    this._ent[id] = new Uint32Array(Math.ceil(this._cmp.length / 32))
    this._setDirty(id)
  }

  destroyEntity(id: number) {
    delete this._ent[id]
    this._setDirty(id)
    this._rm.push(id)
  }

  addComponent(id: number, type: ComponentArray) {
    const i = type[dex]
    this._ent[id][Math.floor(i / 32)] |= 1 << i % 32
    this._setDirty(id)
    return this
  }

  removeComponent(id: number, type: ComponentArray) {
    const i = type[dex]
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

export {ECS, types, not}
