# Accessing components, and AoS vs SoA
There are two ways ot storing data that has a fixed shape. They are called Array of Structs and Struct of Arrays.

An Array of Structs looks like this:
```js
const AoS = [
  {foo: 1, bar: 2},
  {foo: 3, bar: 4},
  {foo: 5, bar: 6},
  {foo: 7, bar: 8},
]
```

A Struct of Arrays looks like this:
```js
const SoA = {
  foo: [1, 3, 5, 7],
  bar: [2, 4, 6, 8],
}
```

Both are completely valid ways of storing the same data, however Array of Structs is more commonly used.

To access an item using AoS, you do this:
```js
console.log(AoS[0].foo)
```

To access an item using SoA, you do this:
```js
console.log(SoA.foo[0])
```

The difference is, using AoS the index comes first, while using SoA the index comes last.

To access a field of a component using WolfECS, the entity ID index comes last.
```js
const ecs = new ECS()
const component = ecs.defineComponent({foo: types.int, bar: types.int})
const id = ecs.createEntity()
ecs.addComponent(id, component)
console.log(component.foo[id])
```
