# WolfECS
![](https://img.shields.io/npm/v/wolf-ecs)
![](https://img.shields.io/badge/coverage-95%25-brightgreen)
![](https://img.shields.io/npm/types/wolf-ecs)
![](https://img.shields.io/npm/dw/wolf-ecs)
![](https://img.shields.io/npm/l/wolf-ecs)

The fastest Entity Component System library for the web.

## Features
- Written in Typescript for full, up to date type support.
- Zero dependencies.
- NOT operator for queries.
- *[It's by far the fastest JS/TS ECS framework that I know of](https://github.com/noctjs/ecs-benchmark).*

### Possible future features
- Hierachies
- Multithreading
- [Finite state machine support](https://ajmmertens.medium.com/why-storing-state-machines-in-ecs-is-a-bad-idea-742de7a18e59) (Sander Mertens)

## Installation
### Installing locally
npm:
```
npm i wolf-ecs
```
yarn:
```
yarn add wolf-ecs
```
Alternatively, download the [latest release](https://github.com/EnderShadow8/wolf-ecs/releases) here on GitHub.

### Using a CDN
JSDelivr:
```js
import { ECS, types, defineSystem } from "https://esm.run/wolf-ecs/wolf-ecs.js"
```

## More on ECS
> Entity–component–system (ECS) is an architectural pattern that is mostly used in game development. ECS follows the composition over inheritance principle that allows greater flexibility in defining entities where every object in a game's scene is an entity (e.g. enemies, bullets, vehicles, etc.). Every entity consists of one or more components which contains data or state.

*- [Wikipedia](https://en.wikipedia.org/wiki/Entity_component_system)*

[This article](https://medium.com/ingeniouslysimple/entities-components-and-systems-89c31464240d) explains ECS very well.

## Usage
First create an ECS instance:
```js
const ecs = new ECS()
```
The ECS constructor takes two arguments:
- `max: number = 1e4` which is the hard limit for the number of entities at a single time.
- `defer: boolean = false` which sets the value of `ecs.DEFAULT_DEFER`, which I'll get to later.

### Define components
Components are defined using `ecs.defineComponent`:
```js
const myComponent = ecs.defineComponent(types.u8)
const position = ecs.defineComponent({
  x: types.f64,
  y: types.f64,
})
```
The object passed defines the shape of the component.

Types available include all numeric types supported by [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)s:

|||||
| - | - | - | - |
| `int8` || `i8` | `char` |
| `uint8` || `u8` | `uchar` |
| `int16` || `i16` | `short` |
| `uint16` || `u16` | `ushort` |
| `int32` || `i32` | `int` |
| `uint32` || `u32` | `uint` |
| `float32` || `f32` | `float` |
| `float64` || `f64` | `double` |
| `int64` | `bigint64` | `i64` | `long` |
| `uint64`| `biguint64`  | `u64` | `ulong` |

For more flexibility, there is also the `any` type.
`custom` is a TypeScript alternative to `any` which allows for - you guessed it - custom types.
```ts
const custom = ecs.defineComponent(types.custom<Set<number>>())
```
Call `ecs.defineComponent` with no arguments to create a tag component, which is usually used as a flag for systems.
```js
const tag = ecs.defineComponent()
```

### Entities
An entity is simply a unique integer ID.

Create entities using `ecs.createEntity`:
```js
const id = ecs.createEntity() // The entity ID is returned
doStuff(id)
```

### Modify components
To modify the values of components, access the component array using the entity ID like so:
```js
const position = ecs.defineComponent({
  x: types.f64,
  y: types.f64,
})
position.x[id]
position.y[id]
```

Add components using `ecs.addComponent` and remove them using `ecs.removeComponent`:
```js
ecs.addComponent(id, component)
ecs.removeComponent(id, component)
```
The values of a component which has just been added are not defined, so it's a good idea to wrap the addition of a component in a custom function.

The third argument defaults to `ecs.DEFAULT_DEFER`. If set to true, defers the operation until the next `ecs.updatePending` call.
```js
ecs.addComponent(id, component, true)
ecs.removeComponent(id, component, true)

doStuff()

ecs.updatePending() // Executes all pending add/remove calls
```
This is useful for avoiding double counting entities in queries, but is slower.

### Queries
To define a query, use `ecs.defineQuery`:
```js
const query = ecs.defineQuery(component1, component2)
```
There are helper functions for defining more complex queries: `all`, `any` and `not`.
```js
const complexQuery = ecs.defineQuery(A, B, any(C, D, E), any(F, not(C), all(G, H, I))
```

### Systems
A system is a function which can be called. This involves iterating over the entities matched by a query.

Using the builtin `query.forEach` function is the more convenient way:
```js
function system() {
  query.forEach(() => {
    doStuff()
  })
}
```
However, this method has serious performance impacts (up to 10x slower) due to the whims of the JS engine.

The more performant method of iterating queries is using a manual for loop:
```js
function system() {
  for(let i = 0; i < query.archetypes.length; i++) {
    const arch = query.archetypes[i].entities
    for(let j = arch.length - 1; j >= 0; j--) { // Backward iteration helps prevent double counting entities
      const id = arch[j]
      console.log(id)
    }
  }
}
```
I've written a [Babel plugin](https://github.com/EnderShadow8/wolf-ecs-system-transform/tree/main) to transform the former style into the latter.

## Contributing
Small pull requests are welcome. For major changes, please open an issue first to discuss the changes you'd like to make.
