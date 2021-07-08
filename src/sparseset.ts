class SparseSet {
  packed: number[] = []
  sparse: number[] = []

  has(x: number) {
    return this.sparse[x] < this.packed.length && this.packed[this.sparse[x]] === x
  }

  add(x: number) {
    if (!this.has(x)) {
      this.sparse[x] = this.packed.length
      this.packed.push(x)
    }
  }

  remove(x: number) {
    if (this.has(x)) {
      const last = this.packed.pop()!
      if (x !== last) {
        this.sparse[last] = this.sparse[x]
        this.packed[this.sparse[x]] = last
      }
    }
  }
}

class Archetype {
  sset = new SparseSet()
  entities = this.sset.packed
  mask
  change: Archetype[] = []

  constructor(mask: Uint32Array) {
    this.mask = mask
  }

  has(x: number) {
    return this.sset.has(x)
  }
}

export {SparseSet, Archetype}
