interface Component {
  type: string
  [props: string]: any
}

class World {
  private _cmp = {} as {[cmp: string]: Component[]}
  curId = 0

  constructor(...componentNames: string[]) {
    for(let cmp of componentNames) {
      if(!(cmp in this._cmp)) {
      }
      this._cmp[cmp] = []
    }
  }

  createEntity(fromObj?: any) {
    if(fromObj) {
      for(let cmp in fromObj) {
        this.addComponent(this.curId, fromObj[cmp], cmp)
      }
    }
    return this.curId++
  }

  addComponent(id: number, component: Component): void
  addComponent(id: number, component: Component, type: string): void
  addComponent(id: number, component: Component, type?: string) {
    if(!type) {
      if(component.type === undefined) {
        throw new TypeError("No component type specified")
      }
      type = component.type
    }
    const cmp = this._cmp[type]
    if(cmp) {
      cmp[id] = component
    } else {
      throw new TypeError("Invalid component type")
    }
  }

  removeComponent(id: number, type: string) {
    const c = this._cmp[type]
    if(c) {
      return delete c[id]
    }
    throw new TypeError("Invalid component type")
  }

  getComponent(id: number, cmp: string): unknown {
    const c = this._cmp[cmp]
    if(c) {
      return c[id]
    }
  }

  query(...cmp: string[]): {[cmp: string]: unknown[]} {
    if(cmp.every(c => c in this._cmp)) {
      const cmps = cmp.map(c => this._cmp[c])
      let bt: boolean[] = Array(Math.min(...cmps.map(i => i.length))).fill(true)
      for(let c of cmps) {
        c.forEach((v, i) => {bt[i] &&= v !== undefined})
      }
      let ans = {} as {[cmp: string]: unknown[]}
      for(let i = 0; i < cmp.length; i++) {
        ans[cmp[i]] = cmps[i].filter((_v, i) => bt[i])
      }
      return ans
    }
    throw new TypeError("Invalid component type")
  }
}
