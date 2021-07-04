type TypedArrayConstructor = Int8ArrayConstructor | Uint8ArrayConstructor | Int16ArrayConstructor | Uint16ArrayConstructor | Int32ArrayConstructor | Uint32ArrayConstructor | Float32ArrayConstructor | Float64ArrayConstructor | BigInt64ArrayConstructor | BigUint64ArrayConstructor
type TypedArray = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array

function custom<T>(init: () => T): [() => T]
function custom<T>(): T[]
function custom<T>(init?: () => T) {
  return init ? [init] : []
}

const types = {
  custom, any: Array,
  int8: Int8Array, i8: Int8Array, char: Int8Array,
  uint8: Uint8Array, u8: Uint8Array, uchar: Uint8Array,
  int16: Int16Array, i16: Int16Array, short: Int16Array,
  uint16: Uint16Array, u16: Uint16Array, ushort: Uint16Array,
  int32: Int32Array, i32: Int32Array, int: Int32Array,
  uint32: Uint32Array, u32: Uint32Array, uint: Uint32Array,
  float32: Float32Array, f32: Float32Array, float: Float32Array,
  float64: Float64Array, f64: Float64Array, double: Float64Array,
  int64: BigInt64Array, bigint64: BigInt64Array, i64: BigInt64Array, long: BigInt64Array,
  uint64: BigUint64Array, biguint64: BigUint64Array, u64: BigUint64Array, ulong: BigUint64Array,
}

type Tree<LeafType> = LeafType | {[key: string]: Tree<LeafType>}
type InitFunc = () => unknown
type Type = TypedArrayConstructor | ArrayConstructor | [InitFunc] | unknown[]

const _componentData = Symbol("componentData")
type ComponentArray<T extends Tree<Type> = Tree<Type>> = (
  T extends [InitFunc]
  ? ReturnType<T[0]>[]
  : T extends unknown[]
  ? T
  : T extends ArrayConstructor
  ? any[]
  : T extends Exclude<Type, unknown[]>
  ? InstanceType<T>
  : {
    [key in keyof T]:
    T[key] extends Tree<Type>
    ? ComponentArray<T[key]>
    : never
  }
)

function createComponentArray<T extends Tree<Type>>(def: T, max: number): ComponentArray<T> {
  if(typeof def === "function") {
    return new (def as any)(max)
  }
  if(def instanceof Array) {
    if(def.length) {
      return [...new Array(max)].map(def[0] as any) as any
    }
    return new Array(max) as any
  }
  const ret: ComponentArray = {}
  for(let i in def) {
    ret[i] = createComponentArray(def[i] as any, max)
  }
  return ret as any
}

export {types, createComponentArray, _componentData, TypedArray, TypedArrayConstructor, Tree, Type, ComponentArray}
