type TypedArrayConstructor = Int8ArrayConstructor | Uint8ArrayConstructor | Int16ArrayConstructor | Uint16ArrayConstructor | Int32ArrayConstructor | Uint32ArrayConstructor | Float32ArrayConstructor | Float64ArrayConstructor | BigInt64ArrayConstructor | BigUint64ArrayConstructor
type TypedArray = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array

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
types.int64 = types.bigint64 = types.i64 = types.long = new Type(BigInt64Array)
types.uint64 = types.biguint64 = types.u64 = types.ulong = new Type(BigUint64Array)

const reverseTypes: Map<TypedArrayConstructor, string> = new Map()
for(let i in types) {
  reverseTypes.set(types[i].arr, i)
}

// Components
type Tree<LeafType> = LeafType | {[key: string]: Tree<LeafType>}
function processTreeFactory<InputLeafType, OutputLeafType>( // Curry!
  processLeaf: (x: InputLeafType) => OutputLeafType,
  isLeaf: (x: Tree<InputLeafType>) => x is InputLeafType
) {
  return function processTree(node: Tree<InputLeafType>) {
    if(isLeaf(node)) {
      return processLeaf(node)
    }
    const ret: Tree<OutputLeafType> = {}
    for(let i in node) {
      ret[i] = processTree(node[i])
    }
    return ret
  }
}

type ComponentDef = Tree<Type>
type ComponentArray = Tree<TypedArray>
type FieldArray = [string, number[], (number | string)[]]
type ComponentJSON = Tree<FieldArray>

function encodeArr(arr: TypedArray) {
  const ret: FieldArray = [reverseTypes.get(Object.getPrototypeOf(arr).constructor)!, [], []]
  let j = 0
  for(let i = 0; i < arr.length; i++) {
    if(arr[i] !== 0) {
      ret[1].push(j)
      const x = arr[i]
      ret[2].push(typeof x === "bigint" ? x.toString() : x)
      j = 0
    }
    j++
  }
  return ret
}

function decodeArr(dt: FieldArray, len: number) {
  const arr = new types[dt[0]].arr(len)
  let j = 0
  for(let i = 0; i < dt[1].length; i += 1) {
    j += dt[1][i]
    const x = dt[2][i]
    arr[j] = typeof x === "string" ? BigInt(x) : x
  }
  return arr
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

// Systems
function defineSystem(query: Query, func: (id: number) => void) {
  return function() {
    for(let i = 0, l = query.archetypes.length; i < l; i++) {
      const ent = query.archetypes[i].entities
      for(let j = ent.length; j > 0; j--) {
        func(ent[j - 1])
      }
    }
  }
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
      const last = this.entities.pop()!
      if(x !== last) {
        this.keys[last] = this.keys[x]
        this.entities[this.keys[x]] = last
      }
    }
  }

  getEntities() { // Slow
    return this.entities.slice()
  }
}

class ECS {
  protected _arch: Map<string, Archetype> = new Map()
  protected _dex: {[cmp: string]: number} = {}
  protected _ent: Archetype[] = []
  protected _queries: Query[] = []
  protected _rm: number[] = []
  protected _rmkeys: boolean[] = []
  protected _empty: Archetype = new Archetype(new Uint32Array())
  protected cmpID = 0
  protected entID = 0
  components: {[name: string]: ComponentArray} = {}
  MAX_ENTITIES: number = 1e4

  constructor(max?: number)
  constructor(serialised: object | string)
  constructor(arg: any) {
    if(typeof arg === "number") {
      this.MAX_ENTITIES = arg
    } else if(arg !== undefined) {
      if(typeof arg === "string") {
        arg = JSON.parse(arg)
      }
      for(let i in arg) {
        if(!["_ent", "components"].includes(i)) {
          this[i as keyof ECS] = arg[i]
        }
      }
      if(this.entID) {
        this._initEmpty()
      }
      for(let i of arg._rm) {
        this._rmkeys[i] = true
      }
      for(let i = 0; i < arg._ent.length; i++) {
        if(arg._ent[i] !== 0) {
          this._ent[i] = this._getArch(new Uint32Array(arg._ent[i]))
          this._ent[i].add(i)
        }
      }
      for(let i in arg.components) {
        this.components[i] = processTreeFactory(
          (leaf: FieldArray) => decodeArr(leaf, this.MAX_ENTITIES),
          (node: ComponentJSON): node is FieldArray => node instanceof Array
        )(arg.components[i])
      } // TODO: docs
    }
  }

  serialise() {
    const ret: any = {} // TODO: better typings
    for(let i in this) {
      if(!["_arch", "_ent", "_queries", "_rmkeys", "_empty", "components"].includes(i)) {
        ret[i] = this[i]
      }
    }
    ret._ent = this._ent.map((a, i) => a.has(i) ? Array.from(a.mask) : 0)
    ret.components = {}
    for(let i in this.components) {
      ret.components[i] = processTreeFactory(
        encodeArr,
        (node: ComponentArray): node is TypedArray => typeof node.length === "number"
      )(this.components[i])
    }
    return ret
  }

  defineComponent(name: string, def: ComponentDef = {}) {
    if(this.entID) {
      throw new Error("Components can only be defined before entities are created")
    }
    if(name in this.components) {
      throw new Error("Duplicate component names")
    }
    if(/^[\w-]+$/.test(name)) {
      this.components[name] = processTreeFactory(
        (node: Type) => new node.arr(this.MAX_ENTITIES),
        (node: ComponentDef): node is Type => node instanceof Type
      )(def)
      this._dex[name] = this.cmpID++
      return this
    }
    throw new Error("Invalid component name: component names can only contain alphanumeric characters, underscores and hyphens.")
  }

  protected _crMask() {
    return new Uint32Array(Math.ceil(this.cmpID / 32))
  }

  protected _initEmpty() {
    this._empty.mask = this._crMask()
    this._arch.set(this._empty.mask.toString(), this._empty)
  }

  createQuery(...types: string[]): Query {
    if(!types.length) {
      throw new Error("Query cannot be empty")
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
    this._arch.forEach(i => {if(match(i.mask, query.mask)) {query.archetypes.push(i)}})
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
    if(i === undefined) {
      throw new Error("Invalid component name")
    }
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
      this._rmkeys[id] = false
      this._crEnt(id)
      return id
    } else {
      if(!this.entID) {
        this._initEmpty()
      }
      this._crEnt(this.entID)
      return this.entID++
    }
  }

  destroyEntity(id: number) {
    if(id < this.entID && !this._rmkeys[id]) {
      this._ent[id].remove(id)
      this._rm.push(id)
      this._rmkeys[id] = true
    }
  }

  addComponent(id: number, cmp: string) {
    const i = this._dex[cmp]
    if(!this._hasComponent(this._ent[id].mask, i)) {
      this._archChange(id, i)
    }
    return this
  }

  removeComponent(id: number, cmp: string) {
    const i = this._dex[cmp]
    if(this._hasComponent(this._ent[id].mask, i)) {
      this._archChange(id, i)
    }
    return this
  }
}

export {ECS, types}
export {ComponentDef, ComponentArray, ComponentJSON, QueryMask} // For Typescript
