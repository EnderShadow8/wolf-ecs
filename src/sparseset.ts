function has(sparse: number[], packed: number[], x: number) {
  return packed[sparse[x]] === x
}

function add(sparse: number[], packed: number[], x: number) {
  if(!has(sparse, packed, x)) {
    sparse[x] = packed.length
    packed.push(x)
  }
}

function remove(sparse: number[], packed: number[], x: number) {
  if(has(sparse, packed, x)) {
    const last = packed.pop()!
    if(x !== last) {
      sparse[last] = sparse[x]
      packed[sparse[x]] = last
    }
  }
}

export {has, add, remove}
