/**
 * An object which manages Components and the Entities which contain them
 *
 * @export
 * @class World
 */
export class World {
  private _cmp: unknown[][] = []
  private _ent: number[] = []
  private _dex: {[cmp: string]: number} = {}
  curId = 0

  /**
   * Creates an instance of World.
   * @param types Names of component types
   * @memberof World
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
   * Creates a new Entity attached to the World
   *
   * @param [fromObj] Object blueprint for the Entity
   * @return Entity ID
   * @memberof World
   */
  createEntity(fromObj?: any) {
    if(fromObj) {
      this._ent[this.curId] = 0
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
   * @memberof World
   */
  addComponent(id: number, type: string, cmp: any) {
    this._ent[id] |= 1 << this._dex[type]
    this.getComponents(type)[id] = cmp
  }

  /**
   * Removes a component from an entity
   *
   * @param id Entity ID
   * @param type Component type
   * @memberof World
   */
  removeComponent(id: number, type: string) {
    this._ent[id] &= ~(1 << this._dex[type])
    delete this.getComponents(type)[id]
  }

  /**
   * Gets a sparse array of all components of a specified type, indexed by entity ID
   *
   * @param cmp Component type
   * @return Sparse array of components
   * @memberof World
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
   * @memberof World
   */
  getComponent(id: number, cmp: string): unknown {
    return this.getComponents(cmp)[id]
  }

  /**
   * Creates a bitmask query that can be used in `World.prototype.EntityHas`
   *
   * @param cmp Component types
   * @return Bitmask query
   * @memberof World
   */
  createQuery(...cmp: string[]): number {
    let query = 0
    cmp.forEach(c => {query |= 1 << this._dex[c]})
    return query
  }
  
  /**
   * Checks whether an entity has components specified in a bitmask query
   *
   * @param id Entity ID
   * @param query Bitmask query
   * @return Boolean representing whether the Entity matches the query
   * @memberof World
   */
  entityHas(id: number, query: number) {
    return (this._ent[id] & query) === query
  }

  // execute(sys: (c: {[name: string]: any}) => void, query: string[]) {
  //   const cmp = query.filter(c => c[0] !== "!" && c[0] !== "@")
  //   const req = query.filter(c => c[0] === "@").map(c => c.slice(1))
  //   const not = query.filter(c => c[0] === "!").map(c => c.slice(1))
  //   const cmps = cmp.map(c => this.getComponents(c))
  //   const reqs = req.map(c => this.getComponents(c))
  //   const nots = not.map(c => this.getComponents(c))
  //   if(cmp.concat(req).every(c => c in this._cmp)) {
  //     outer:
  //     for(let i = 0; i < Math.min(...cmps.concat(reqs).map(c => c.length)); i++) {
  //       for(let c of cmps.concat(reqs)) {
  //         if(c === undefined) {
  //           continue outer
  //         }
  //       }
  //       for(let c of nots) {
  //         if(c !== undefined) {
  //           continue outer
  //         }
  //       }
  //       let obj: {[name: string]: any} = {}
  //       for(let c of cmp) {
  //         obj[c] = this.getComponents(c)[i]
  //       }
  //       sys(obj)
  //     }
  //   }
  //   throw new ECSError("Component type not found")
  // }
}

export class ECSError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ECSError"
  }
}
