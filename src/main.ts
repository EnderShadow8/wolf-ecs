type Query = [Uint32Array, Uint32Array]

/**
 * An object which manages entities, components and systems.
 *
 * @export
 * @class ECS
 */
export class ECS {
  private _cmp: unknown[][] = []
  private _dex: {[cmp: string]: number} = {}
  private _ent: Uint32Array[] = []
  private _sys: System[] = []
  private _dirty: number[] = []
  private _dirtykeys: boolean[] = [] // O(1) lookup table
  private _ids: number[] = []
  curID = 0

  /**
   * Creates an instance of ECS.
   * @param components Array of component type names
   * @memberof ECS
   */
  constructor(...components: string[]) {
    for(let i = 0; i < components.length; i++) {
      const cmp = components[i]
      if(!(/^(?:[a-zA-Z0-9-])*$/.test(cmp))) {
        throw new ECSError("Invalid component type name")
      }
      if(!(cmp in this._cmp)) {
        this._dex[cmp] = i
        this._cmp[i] = []
      } else {
        throw new ECSError("Duplicate component type names")
      }
    }
  }
  
  /**
   * Adds a system to the ECS.
   * Systems execute in the order they are added.
   *
   * @param sys System to be added
   * @memberof ECS
   */
  addSystem(sys: System) {
    sys.ecs = this
    this._sys.push(sys)
  }

  /**
   * Creates a new Entity attached to the ECS.
   *
   * @param fromObj Object blueprint for the Entity
   * @return Entity ID
   * @memberof ECS
   */
  createEntity(fromObj?: {[type: string]: unknown}): number {
    this._ent[this.curID] = new Uint32Array(Math.ceil(this._cmp.length / 32))
    if(fromObj) {
      for(let cmp in fromObj) {
        this.addComponent(this.curID, cmp, fromObj[cmp])
      }
    }
    this._setDirty(this.curID)
    return this.curID++
  }

  /**
   * Removes all components from an entity, and therefore deregisters it from all systems.
   * In the future may also mark the ID as reusable.
   *
   * @param {number} id
   * @memberof ECS
   */
  destroyEntity(id: number) {
    for(let c in this._dex) {
      this.removeComponent(id, c)
    }
  }

  /**
   * Adds a component to an Entity.
   *
   * @param id Entity ID
   * @param type Name of component
   * @param cmp Component object
   * @chainable
   * @memberof ECS
   */
  addComponent(id: number, type: string, cmp?: unknown) {
    const i = this._dex[type]
    this._ent[id][Math.floor(i / 32)] |= 1 << i % 32
    if(cmp) {
      this.getComponents(type)[id] = cmp
    }
    this._setDirty(id)
    return this
  }

  /**
   * Removes a Component from an Entity.
   *
   * @param id Entity ID
   * @param type Component type
   * @chainable
   * @memberof ECS
   */
  removeComponent(id: number, type: string) {
    const i = this._dex[type]
    this._ent[id][Math.floor(i / 32)] &= ~(1 << i % 32)
    this._setDirty(id)
    return this
  }

  /**
   * Gets a sparse array of all components of a specified type, indexed by entity ID.
   *
   * @param type Component type
   * @return Sparse array of components
   * @memberof ECS
   */
  getComponents(type: string): unknown[] {
    const cmp = this._cmp[this._dex[type]]
    if(cmp) {
      return cmp
    }
    throw new ECSError("Component type not found")
  }

  /**
   * Flags an entity as dirty, i.e. modified.
   *
   * @private
   * @param {number} id
   * @memberof ECS
   */
   private _setDirty(id: number) {
    if(!this._dirtykeys[id]) {
      this._dirty.push(id)
      this._dirtykeys[id] = true
    }
  }

  /**
   * Processes any entities that have been flagged as dirty.
   * Registers and deregisters modified entities from systems.
   *
   * @private
   * @memberof ECS
   */
  private _clean() {
    for(let id of this._dirty) {
      for(let s of this._sys) {
        const match = this._match(id, s.query)
        if(match && !s.keys[id]) {
          s.keys[id] = true
          s.entities.push(id)
        }
        if(!match && s.keys[id]) { // Too slow?
          delete s.keys[id]
          delete s.entities[s.entities.indexOf(id)]
        }
      }
    }
    for(let s of this._sys) {
      compact(s.entities)
    }
    this._dirty = []
    this._dirtykeys = []
  }

  /**
   * Creates a query.
   * A component name prefixed with `!` will match if an entity does *not* have that component.
   *
   * @param types Component types
   * @return Bitmask Query
   * @memberof ECS
   */
  createQuery(...types: string[]): Query {
    const has = types.filter(c => c[0] !== "!")
    const not = types.filter(c => c[0] === "!").map(c => c.slice(1))
    const hasq = new Uint32Array(Math.ceil(this._cmp.length / 32))
    const notq = new Uint32Array(Math.ceil(this._cmp.length / 32))
    has.forEach((c, i) => {hasq[Math.floor(i / 32)] |= 1 << this._dex[c] % 32})
    not.forEach((c, i) => {notq[Math.floor(i / 32)] |= 1 << this._dex[c] % 32})
    return [hasq, notq]
  }

  /**
   * Checks whether an Entity matches a bitmask query.
   *
   * @param id Entity ID
   * @param query Query
   * @return Boolean representing whether the Entity matches the query
   * @memberof ECS
   */
  private _match(id: number, query: Query) {
    for(let i = 0; i < query[0].length; i++) {
      if((this._ent[id][i] & query[0][i]) !== query[0][i]) {
        return false
      }
    }
    for(let i = 0; i < query[1].length; i++) {
      if((this._ent[id][i] & query[1][i]) > 0) {
        return false
      }
    }
    return true
  }
  
  /**
   * Executes all systems.
   *
   * @memberof ECS
   */
  tick() {
    for(let s of this._sys) {
      s.execute()
      this._clean()
    }
  }
}

/**
 * A system which performs operations on entities that match a specified query.
 *
 * @export
 * @class System
 */
export class System {
  ecs: ECS
  query: Query
  entities: number[] = []
  keys: boolean[] = [] // O(1) lookup table
  execute: () => void

  /**
   * Creates an instance of System.
   * @param ecs
   * @param query
   * @param execute
   * @memberof System
   */
  constructor(query: Query, execute: () => void) {
    this.ecs = ECS.prototype // To keep Typescript happy
    this.query = query
    this.execute = execute
  }
}

/**
 * Error relating to ECS.
 *
 * @export
 * @class ECSError
 * @extends {Error}
 */
export class ECSError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ECSError"
  }
}

/**
 * Removes all empty elements of an array in place.
 *
 * @param a Array to be compacted
 */
function compact(a: unknown[]) {
  let j = 0
  for(let i in a) {
    if(typeof a[i] === "number") {
      a[j++] = a[i]
    }
  }
  a.length = j
}
