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
  curId = 0

  /**
   * Creates an instance of BinaryECS.
   * @param types `{Component type name: bytes per component}`
   * @param maxEntities Maximum number of entities at one time (default 256)
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
  createEntity(fromObj?: any) {
    this._ent[this.curId] = new Uint32Array(Math.ceil(this._cmp.length / 32))
    if(fromObj) {
      for(let cmp in fromObj) {
        this.addComponent(this.curId, fromObj[cmp], cmp)
      }
    }
    return this.curId++
  }

  /**
   * Adds a component to an Entity
   *
   * @param id Entity ID
   * @param type Name of component
   * @param cmp Component object
   * @memberof ECS
   */
   addComponent(id: number, type: string, cmp: any) {
    const i = this._dex[type]
    this._ent[id][Math.floor(i / 32)] |= 1 << i % 32
    this.getComponents(type)[id] = cmp
  }

  /**
   * Removes a Component from an Entity.
   *
   * @param id Entity ID
   * @param type Component type
   * @memberof ECS
   */
  removeComponent(id: number, type: string) {
    const i = this._dex[type]
    this._ent[id][Math.floor(i / 32)] &= ~(1 << i % 32)
    // No need to delete since flag is set to 0 already
  }

  /**
   * Gets a sparse array of all components of a specified type, indexed by entity ID
   *
   * @param cmp Component type
   * @return Sparse array of components
   * @memberof ECS
   */
  getComponents(cmp: string): unknown[] {
    const c = this._cmp[this._dex[cmp]]
    if(c) {
      return c
    }
    throw new ECSError("Component type not found")
  }

  /**
   * Gets a component by entity ID and type
   *
   * @param id Entity ID
   * @param cmp Component type
   * @return Component object
   * @memberof ECS
   */
  getComponent(id: number, cmp: string): unknown {
    return this.getComponents(cmp)[id]
  }

  /**
   * Creates a bitmask query that can be used in `ECS.prototype.EntityHas`.
   *
   * @param cmp Component types
   * @return Bitmask query
   * @memberof ECS
   */
  createQuery(...cmp: string[]) {
    let query = new Uint8Array(Math.ceil(this._cmp.length / 32))
    cmp.forEach((c, i) => {query[Math.floor(i / 32)] |= 1 << this._dex[c] % 32})
    return query
  }

  /**
   * Checks whether an Entity has Components specified in a bitmask query.
   *
   * @param id Entity ID
   * @param query Bitmask query
   * @return Boolean representing whether the Entity matches the query
   * @memberof ECS
   */
  entityHas(id: number, query: Uint8Array) {
    for(let i = 0; i < query.length; i++) {
      if((this._ent[id][i] & query[i]) !== query[i]) {
        return false
      }
    }
    return true
  }
}

/**
 * Error relating to an ECS.
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

