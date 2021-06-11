type TypedArrayConstructor = Int8ArrayConstructor | Uint8ArrayConstructor | Int16ArrayConstructor | Uint16ArrayConstructor | Int32ArrayConstructor | Uint32ArrayConstructor | Float32ArrayConstructor | Float64ArrayConstructor | BigInt64ArrayConstructor | BigUint64ArrayConstructor
type TypedArray = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array

class Type<arr extends TypedArrayConstructor = TypedArrayConstructor> {
  arr: TypedArrayConstructor
  constructor(arr: arr) {
    this.arr = arr
  }
}

const types = {
  int8: new Type(Int8Array), i8: new Type(Int8Array), char: new Type(Int8Array),
  uint8: new Type(Uint8Array), u8: new Type(Uint8Array), uchar: new Type(Uint8Array),
  int16: new Type(Int16Array), i16: new Type(Int16Array), short: new Type(Int16Array),
  uint16: new Type(Uint16Array), u16: new Type(Uint16Array), ushort: new Type(Uint16Array),
  int32: new Type(Int32Array), i32: new Type(Int32Array), int: new Type(Int32Array),
  uint32: new Type(Uint32Array), u32: new Type(Uint32Array), uint: new Type(Uint32Array),
  float32: new Type(Float32Array), f32: new Type(Float32Array), float: new Type(Float32Array),
  float64: new Type(Float64Array), f64: new Type(Float64Array), double: new Type(Float64Array),
  int64: new Type(BigInt64Array), bigint64: new Type(BigInt64Array), i64: new Type(BigInt64Array), long: new Type(BigInt64Array),
  uint64: new Type(BigUint64Array), biguint64: new Type(BigUint64Array), u64: new Type(BigUint64Array), ulong: new Type(BigUint64Array),
}

type TypeName = keyof typeof types

const reverseTypes: Map<TypedArrayConstructor, TypeName> = new Map()
for(let i in types) {
  const j = i as TypeName
  reverseTypes.set(types[j].arr, j)
}

export {types, Type, reverseTypes, TypedArray, TypeName}
