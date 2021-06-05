# Component
In WolfECS, components are not stored in an Array of Structs, but rather in a Struct of Arrays. [This is an important distinction to make.](soa.md)

There is no Component class. Rather, these are some additional classes and Typescript types which are used to manage components.

## `Type`
This class is only used for declaring component types.

The `Type`s exposed to the user are in the `types` export.

| Aliases |||| Description |
| - | - | - | - | - |
| `int8` || `i8` | `char` | 8-bit signed integer. |
| `uint8` || `u8` | `uchar` | 8-bit unsigned integer. |
| `int16` || `i16` | `short` | 16-bit signed integer. |
| `uint16` || `u16` | `ushort` | 16-bit unsigned integer. |
| `int32` || `i32` | `int` | 32-bit signed integer. |
| `uint32` || `u32` | `uint` | 32-bit unsigned integer. |
| `float32` || `f32` | `float` | 32-bit floating point number. |
| `float64` || `f64` | `double` | 64-bit double precision floating point number. |
___

## `ComponentDef`
This type is used to define a component using `ECS.defineComponent`.

### Type
`{`[`Type`](types.md)` | {[key: string]: ComponentDef}}`

### Example usage
```js
const def = {
  foo: types.u16,
  bar: {
    foobar: types.f32
    baz: types.i32
  }
}

const component = ecs.defineComponent(def)
```

## `ComponentArray`
This type is used to store and lookup components.

### Type
`{Array | TypedArray | {[key: string]: ComponentArray}}`

### Example usage
```js
const def = {
  foo: types.u16,
  bar: {
    foobar: types.f32
    baz: types.i32
  }
}

const component = ecs.defineComponent(def)
```
