// Components
const dex = Symbol()
type TypedArrayConstructor = Int8ArrayConstructor | Uint8ArrayConstructor | Int16ArrayConstructor | Uint16ArrayConstructor | Int32ArrayConstructor | Uint32ArrayConstructor | Float32ArrayConstructor | Float64ArrayConstructor
type TypedArray = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array
type SoA = TypedArray | SoA[] | {[key: string]: SoA}
type ComponentDef = Primitive | {[key: string]: ComponentDef}
type ComponentArray = SoA & {[dex]: number}

class Primitive {
  arr: TypedArrayConstructor
  constructor(arr: TypedArrayConstructor) {
    this.arr = arr
  }
}

function createSoA(def: ComponentDef, len: number): SoA {
  if(def instanceof Primitive) {
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

  /**
   * Creates an instance of System.
   * @param ecs
   * @param func
   * @memberof System
   */
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
  keys: boolean[] = [] // O(1) lookup table

  constructor(mask: QueryMask) {
    this.mask = mask
  }
}

// ECS
class ECS {
  protected _cmp: ComponentArray[] = []
  protected _ent: Uint32Array[] = []
  protected _queries: Query[] = []
  protected _dirty: number[] = []
  protected _dirtykeys: boolean[] = []
  protected _rm: number[] = []
  protected _init =  false
  protected cmpID = 0
  protected entID = 0
  MAX_ENTITIES: number

  constructor(max: number = 1e4) {
    this.MAX_ENTITIES = max
  }

  defineComponent(def: ComponentDef): ComponentArray {
    if(this._init) {
      throw new Error("Components can only be defined before entities are created.")
    }
    const cmp = Object.assign(createSoA(def, this.MAX_ENTITIES), {[dex]: this.cmpID++})
    this._cmp.push(cmp)
    return cmp
  }

  defineSystem(func: () => void) {
    return new System(this, func)
  }

  createEntity(): number {
    if(this._rm.length) {
      const id = this._rm.pop()!
      this._create(id)
      return id
    } else {
      this._create(this.entID)
      return this.entID++
    }
  }
  
  protected _create(id: number) {
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

  createQuery(...types: ComponentArray[]): Query {
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

  protected _setDirty(id: number) {
    if(!this._dirtykeys[id]) {
      this._dirty.push(id)
      this._dirtykeys[id] = true
    }
  }

  _clean() {
    const toCompact: number[][] = []
    for(let id of this._dirty) {
      for(let q of this._queries) {
        const match = this.match(id, q.mask)
        if(match && !q.keys[id]) {
          q.keys[id] = true
          q.entities.push(id)
        }
        if(!match && q.keys[id]) { // Too slow?
          delete q.keys[id]
          delete q.entities[q.entities.indexOf(id)]
          toCompact.push(q.entities)
        }
      }
    }
    for(let i = 0, l = toCompact.length; i < l; i++) {
      compact(toCompact[i])
    }
    this._dirty = []
    this._dirtykeys = []
  }

  match(id: number, mask: QueryMask) {
    for(let i = 0; i < mask[0].length; i++) {
      if((this._ent[id][i] & mask[0][i]) !== mask[0][i]) {
        return false
      }
    }
    for(let i = 0; i < mask[1].length; i++) {
      if((this._ent[id][i] & mask[1][i]) > 0) {
        return false
      }
    }
    return true
  }
}

const types = {
  Int8: new Primitive(Int8Array),
  Uint8: new Primitive(Uint8Array),
  Int16: new Primitive(Int16Array),
  Uint16: new Primitive(Uint16Array),
  Int32: new Primitive(Int32Array),
  Uint32: new Primitive(Uint32Array),
  Float32: new Primitive(Float32Array),
  Float64: new Primitive(Float64Array),
}

export {ECS, types}

function compact(a: unknown[]) {
  let j = 0
  a.forEach(v => {a[j] = v; j++})
  a.length = j
}
