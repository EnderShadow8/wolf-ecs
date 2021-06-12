import {Type, TypedArray} from "./types"
import {encodeArr, decodeArr, FieldArray} from "./stringify"
import {Query} from "./query"
import {Archetype} from "./archetype"

type Tree<LeafType> = LeafType | {[key: string]: Tree<LeafType>}

type ComponentDef = Tree<Type>
type ComponentArray = Tree<TypedArray>
type ComponentJSON = Tree<FieldArray>

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

// ECS
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
      throw new Error("cannot define component after entity creation")
    }
    if(name in this.components) {
      throw new Error("duplicate component names")
    }
    if(/^[\w-]+$/.test(name)) {
      this.components[name] = processTreeFactory(
        (node: Type) => new node.arr(this.MAX_ENTITIES),
        (node: ComponentDef): node is Type => node instanceof Type
      )(def)
      this._dex[name] = this.cmpID++
      return this
    }
    throw new Error("invalid component name")
  }

  protected _initEmpty() {
    this._empty.mask = new Uint32Array(Math.ceil(this.cmpID / 32))
    this._arch.set(this._empty.mask.toString(), this._empty)
  }

  createQuery(...cmps: string[]): Query {
    if(!cmps.length) {
      throw new Error("empty query")
    }
    const or = cmps.filter(c => c.includes(" ")).map(i => i.split(" "))
    cmps = cmps.filter(c => !c.includes(" "))
    const query = new Query([cmps, ...or].map(i => {
      const p: [(number | undefined)[], (number | undefined)[]] = [
        i.filter(c => c[0] !== "!").map(c => this._dex[c]),
        i.filter(c => c[0] === "!").map(c => this._dex[c.slice(1)])
      ]
      if(p.map(i => i.includes(undefined)).includes(true)) {
        throw new Error("invalid component name")
      }
      return p as [number[], number[]]
    }))
    this._arch.forEach(i => {if(Query.match(i.mask, query.mask)) {query.archetypes.push(i)}})
    this._queries.push(query)
    return query
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
    if(i === undefined) {
      throw new Error("invalid component name")
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

export {ECS, Tree, ComponentDef, ComponentArray, ComponentJSON}
