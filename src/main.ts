class World {
  private _cmp = new Map<string, unknown[]>()
  curId = 0

  constructor(...componentNames: string[]) {
    for(let c of componentNames) {
      if(!(c in this._cmp)) {
      }
      this._cmp.set(c, [])
    }
  }

  createEntity(fromObj?: any) {
    if(fromObj) {
      for(let cmp in fromObj) {
        this.addComponent(this.curId, cmp, fromObj[cmp])
      }
    }
    return this.curId++
  }

  addComponent(id: number, component: {type: string}): void
  addComponent(id: number, component: any, type: string): void
  addComponent(id: number, component: any, type?: string) {
    if("type" in component) {
      if(type !== undefined && component.type !== type) {
        throw new TypeError("Conflicting component types")
      }
      type = component.type
      delete component.type
    }
    const cmp = this._cmp.get(type!)
    if(cmp) {
      cmp[id] = component
    } else {
      throw new TypeError("Invalid component type")
    }
  }

  removeComponent(id: number, type: string) {
    const c = this._cmp.get(type)
    if(c) {
      return delete c[id]
    }
    throw new TypeError("Invalid component type")
  }

  getComponent(id: number, cmp: string): unknown {
    const c = this._cmp.get(cmp)
    if(c) {
      return c[id]
    }
  }

  query(...cmp: string[]): {[cmp: string]: unknown[]} {
    const cmps = cmp.map(q => this._cmp.get(q))
    if(!cmps.includes(undefined)) {
      let bt: boolean[] = Array(Math.min(...cmps.map(i => i!.length))).fill(true)
      for(let c of cmps) {
        c!.forEach((v, i) => {bt[i] &&= v !== undefined})
      }
      let ans = {} as {[cmp: string]: unknown[]}
      for(let i = 0; i < cmp.length; i++) {
        ans[cmp[i]] = cmps[i]!.filter((_v, i) => bt[i])
      }
      return ans
    }
    throw new TypeError("Invalid component type")
  }
}
