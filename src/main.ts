/**
 * An object which manages Components and the Entities which contain them.
 *
 * @export
 * @class ECS
 */
export class ECS {
  private _cmp: unknown[][] = []
  private _ent: Uint32Array[] = []
  private _dex: {[cmp: string]: number} = {}
  private _ids: number[] = []
  curID = 0

  /**
   * Creates an instance of ECS.
   * @param types List of component type names
   * @memberof ECS
   */
  constructor(...types: string[]) {
    for(let i = 0; i < types.length; i++) {
      const cmp = types[i]
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
   * Creates a new Entity attached to the ECS
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
    return this.curID++
  }

  /**
   * Adds a component to an Entity
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
    // No need to delete since flag is set to 0 already
    return this
  }

  /**
   * Gets a sparse array of all components of a specified type, indexed by entity ID
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
   * Gets a component by entity ID and type
   *
   * @param id Entity ID
   * @param type Component type
   * @return Component object
   * @memberof ECS
   */
  getComponent(id: number, type: string): unknown {
    return this.getComponents(type)[id]
  }

  /**
   * Creates a bitmask that can be used in `EntityHas` or `EntityHasNot`. A component name prefixed with `!` will match if an entity does *not* have that component.
   *
   * @param query Component types
   * @return Bitmask
   * @memberof ECS
   */
  createQuery(...types: string[]) {
    const has = types.filter(c => c[0] !== "!")
    const not = types.filter(c => c[0] === "!").map(c => c.slice(1))
    const query = Array.from({length: 1 + +!!not.length}, () => new Uint32Array(Math.ceil(this._cmp.length / 32)))
    has.forEach((c, i) => {query[0][Math.floor(i / 32)] |= 1 << this._dex[c] % 32})
    if(not.length) {
      not.forEach((c, i) => {query[1][Math.floor(i / 32)] |= 1 << this._dex[c] % 32})
    }
    return query
  }

  /**
   * Checks whether an Entity matches a bitmask query.
   *
   * @param id Entity ID
   * @param query Query
   * @return Boolean representing whether the Entity matches the query
   * @memberof ECS
   */
  match(id: number, query: Uint32Array[]) {
    for(let i = 0; i < query[0].length; i++) {
      if((this._ent[id][i] & query[0][i]) !== query[0][i]) {
        return false
      }
    }
    if(query[1]) {
      for(let i = 0; i < query[1].length; i++) {
        if((this._ent[id][i] & query[1][i]) > 0) {
          return false
        }
      }
    }
    return true
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
