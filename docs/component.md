# Component
In WolfECS, components are not stored in an Array of Structs, but rather in a Struct of Arrays. [This is an important distinction to make.](soa.md)

There is no Component class. Rather, these are some additional classes and Typescript types which are used to manage components.

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
