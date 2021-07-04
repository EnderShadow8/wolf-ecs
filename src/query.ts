import {Archetype} from "./archetype"
import {_componentData, ComponentArray} from "./component"
import {ECS} from "./ecs"

function all<Q extends (RawQuery | ComponentArray)>(...cmps: Q[]) {
  if(!cmps.length) {
    throw new Error("no arguments passed")
  }
  return {op: all, dt: cmps}
}

function not<Q extends (RawQuery | ComponentArray)>(cmp: Q) {
  return {op: not, dt: typeof (cmp as RawQuery).op === "function" ? cmp : all(cmp)}
}

function any<Q extends (RawQuery | ComponentArray)>(...cmps: Q[]) {
  if(!cmps.length) {
    throw new Error("no arguments passed")
  }
  return {op: any, dt: cmps}
}

type MLeaf = {op: typeof all | typeof any, dt: Uint32Array}
type Group = {op: typeof all | typeof any, dt: [MLeaf, ...QueryMask[]]}
type Not = {op: typeof not, dt: QueryMask}
type QueryMask = Group | Not | MLeaf

type RawQuery = {op: typeof all | typeof any, dt: (RawQuery | ComponentArray)[]}
| {op: typeof not, dt: RawQuery | ComponentArray}

class Query {
  mask: QueryMask
  archetypes: Archetype[] = []
  ecs

  constructor(ecs: ECS, q: RawQuery | undefined) {
    const crQuery = (raw: RawQuery): QueryMask => {
      if(raw.op === not) {
        return {op: raw.op, dt: crQuery(raw.dt as RawQuery)} as QueryMask
      }
      const nums: number[] = []
      const ret: [MLeaf, ...QueryMask[]] = [{op: raw.op, dt: new Uint32Array()} as MLeaf]
      for(let i of raw.dt as RawQuery[]) {
        if(_componentData in i) {
          if((i as any)[_componentData].ecs === ecs) {
            nums.push((i as any)[_componentData].id)
          } else {
            throw new Error("component does not belong to this ECS")
          }
        } else {
          ret.push(crQuery(i))
        }
      }
      ret[0].dt = new Uint32Array(Math.ceil((Math.max(-1, ...nums) + 1) / 32))
      for(let i of nums) {
        ret[0].dt[Math.floor(i / 32)] |= 1 << i % 32
      }
      return {op: raw.op, dt: ret} as QueryMask
    }
    this.mask = q ? crQuery(q) : {op: all, dt: new Uint32Array()}
    this.ecs = ecs
  }

  forEach(callbackfn: (id: number, ecs: ECS) => void) {
    for(let i = 0, l = this.archetypes.length; i < l; i++) {
      const ent = this.archetypes[i].entities
      for(let j = ent.length; j > 0; j--) {
        callbackfn(ent[j - 1], this.ecs)
      }
    }
  }

  _forEach(callbackfn: (id: number, ecs: ECS) => void) {
    this.forEach(callbackfn)
  }

  static match(target: Uint32Array, mask: QueryMask): boolean {
    if("BYTES_PER_ELEMENT" in mask.dt) {
      return Query.partial(target, mask as MLeaf)
    }
    if(mask.op === not) {
      return !Query.match(target, mask.dt as QueryMask)
    }
    if(mask.op === all) {
      for(let q of (mask as Group).dt) {
        if(!Query.match(target, q)) {
          return false
        }
      }
      return true
    }
    for(let q of (mask as Group).dt) {
      if(Query.match(target, q)) {
        return true
      }
    }
    return false
  }

  protected static partial(target: Uint32Array, mask: MLeaf) {
    if(mask.op === all) {
      for(let i = 0; i < mask.dt.length; i++) {
        if((target[i] & mask.dt[i]) < mask.dt[i]) {
          return false
        }
      }
      return true
    }
    for(let i = 0; i < mask.dt.length; i++) {
      if((target[i] & mask.dt[i]) > 0) {
        return true
      }
    }
    return false
  }
}

export {all, not, any, Query, QueryMask, RawQuery, MLeaf}
