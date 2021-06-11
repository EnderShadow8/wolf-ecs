import {types, reverseTypes, TypedArray, TypeName} from "./types"

type FieldArray = [TypeName, number[], (number | string)[]]

function encodeArr(arr: TypedArray) {
  const ret: FieldArray = [reverseTypes.get(Object.getPrototypeOf(arr).constructor)!, [], []]
  let j = 0
  for(let i = 0; i < arr.length; i++) {
    if(arr[i] !== 0) {
      ret[1].push(j)
      const x = arr[i]
      ret[2].push(typeof x === "bigint" ? x.toString() : x)
      j = 0
    }
    j++
  }
  return ret
}

function decodeArr(dt: FieldArray, len: number) {
  const arr = new types[dt[0]].arr(len)
  let j = 0
  for(let i = 0; i < dt[1].length; i += 1) {
    j += dt[1][i]
    const x = dt[2][i]
    arr[j] = typeof x === "string" ? BigInt(x) : x
  }
  return arr
}

export {encodeArr, decodeArr, FieldArray}
