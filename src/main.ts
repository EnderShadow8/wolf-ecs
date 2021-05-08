import {ComponentError} from "./utils"

export interface Component {
  type: string
  [props: string]: any
}

export class World {
  private _cmp = {} as {[cmp: string]: Component[]}
  curId = 0

  constructor(...componentNames: string[]) {
    for(let cmp of componentNames) {
      if(!(/^(?:[a-zA-Z0-9-])*$/.test(cmp))) {
        throw new ComponentError("Invalid component name")
      }
      if(!(cmp in this._cmp)) {
        this._cmp[cmp] = []
      } else {
        throw new ComponentError("Duplicate component names")
      }
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
        throw new ComponentError("No component type specified")
      }
      type = component.type
    }
    const cmp = this._cmp[type]
    if(cmp) {
      cmp[id] = component
    } else {
      throw new ComponentError("Component type not found")
    }
  }

  removeComponent(id: number, type: string) {
    const c = this._cmp[type]
    if(c) {
      return delete c[id]
    }
    throw new ComponentError("Component type not found")
  }

  getComponent(id: number, cmp: string): Component | undefined {
    const c = this._cmp[cmp]
    if(c) {
      return c[id]
    }
    throw new ComponentError("Component type not found")
  }

  query(...cmp: string[]): {[cmp: string]: Component[]} {
    const not = cmp.filter(c => c[0] === "!").map(c => c.slice(1))
    cmp.filterInPlace(c => c[0] !== "!")
    if(cmp.concat(not).every(c => c in this._cmp)) {
      const cmps = cmp.map(c => this._cmp[c])
      const nots = not.map(c => this._cmp[c])
      let bt: boolean[] = new Array(cmps[0].length).fill(true)
      for(let c of cmps) {
        c.forEach((v, i) => {bt[i] &&= v !== undefined})
      }
      for(let c of nots) {
        c.forEach((v, i) => {bt[i] &&= v === undefined})
      }
      let ans = {} as {[cmp: string]: Component[]}
      for(let i = 0; i < cmp.length; i++) {
        ans[cmp[i]] = cmps[i].filter((_v, i) => bt[i])
      }
      return ans
    }
    throw new ComponentError("Component type not found")
  }
}
