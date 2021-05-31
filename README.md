# WolfECS
![](https://img.shields.io/npm/v/wolf-ecs)
![](https://img.shields.io/badge/coverage-100%25-brightgreen)
![](https://img.shields.io/npm/types/wolf-ecs)
![](https://img.shields.io/npm/dw/wolf-ecs)
![](https://img.shields.io/npm/l/wolf-ecs)

WolfECS is a powerful, lightweight ECS framework written in Typescript.

## Features
- Written in Typescript for full, up to date type support.
- Zero dependencies.
- NOT operator for queries.
- Statically typed components for speed.
- Archetypes using bitwise operations for enhanced performance.
- Did I mention it's *[fast](https://github.com/EnderShadow8/ecs-benchmark)?*

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
import { ECS, types } from "https://esm.run/wolf-ecs/wolf-ecs.js"
```

## Usage
Find detailed documentation [here](docs/docs.md).

```js
import { ECS, types } from "wolf-ecs"

// Create ECS object
const ecs = new ECS()

// Define the shape of a component
const vector = {x: types.i32, y: types.i32}

// Define a component using a component definition
ecs.defineComponent("position", vector)
ecs.defineComponent("velocity", vector)

// Create a query which requires certain components
const moveQuery = ecs.createQuery("position", "velocity")

// Define a system
function moveSystem() {
  // Get relevant components
  const position = ecs.components.position
  const velocity = ecs.components.veslocity

  // Iterate over all entities that match a query
  for(let archetype of moveQuery.archetypes) {
    for(let entity of archetype.entities) {
      position.x[entity] += velocity.x[entity]
      position.y[entity] += velocity.y[entity]
    }
  }
}

// Create an entity
const entity = ecs.createEntity()

// Add components to entity
ecs.addComponent(entity, "position")
ecs.addComponent(entity, "velocity")

// Values must be set otherwise undefined behaviour will occur
ecs.components.position.x[entity] = 1
ecs.components.position.y[entity] = 1
ecs.components.velocity.x[entity] = 1
ecs.components.velocity.y[entity] = 1

// Main loop
function main() {
  // Execute a system
  moveSystem()
  requestAnimationFrame(main)
}
main()
```

## More on ECS
> Entity–component–system (ECS) is an architectural pattern that is mostly used in game development. ECS follows the composition over inheritance principle that allows greater flexibility in defining entities where every object in a game's scene is an entity (e.g. enemies, bullets, vehicles, etc.). Every entity consists of one or more components which contains data or state.

*- [Wikipedia](https://en.wikipedia.org/wiki/Entity_component_system)*

[This article](https://medium.com/ingeniouslysimple/entities-components-and-systems-89c31464240d) explains ECS very well.

## Contributing
Small pull requests are welcome. For major changes, please open an issue first to discuss the changes you'd like to make.
