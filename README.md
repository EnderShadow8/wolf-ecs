# WolfECS

WolfECS is a powerful, lightweight ECS framework written in Typescript.

## Installation

npm:
```
npm i wolf-ecs
```
yarn:
```
yarn add wolf-ecs
```
Alternatively, download the [latest release](https://github.com/EnderShadow8/wolf-ecs/releases) here on GitHub.

A CDN is on my todo list.

## Features

- Written in Typescript for full, up to date type support.
- NOT operator for queries.
- Statically typed components for speed.
- Incrementally updated queries and bitmasks for enhanced performance.
- Did I mention it's *fast?*

## Usage

TODO: docs

```js
import { ECS, types } from "wolf-ecs"

// Create ECS object
const ecs = new ECS()

// Define the shape of a component
const vector = {x: types.i32, y: types.i32}

// Define a component using a component definition
const position = ecs.defineComponent(vector)
const velocity = ecs.defineComponent(vector)

// Create a query which requires certain components
const moveQuery = ecs.createQuery(position, velocity)

// Define a system
const moveSystem = ecs.defineSystem(function() {
  // Iterate over all entities that match a query
  for(let entity of moveQuery.entities) {
    position.x[entity] += velocity.x[entity]
    position.y[entity] += velocity.y[entity]
  }
})

// Create an entity
const entity = ecs.createEntity()

// Add components to entity
ecs.addComponent(entity, position)
ecs.addComponent(entity, velocity)

// Values must be set otherwise undefined behaviour will occur
position.x[entity] = 1
position.y[entity] = 1
velocity.x[entity] = 1
velocity.y[entity] = 1

// Main loop
function main() {
  // Execute a system
  moveSystem.execute()
  requestAnimationFrame(main)
}
main()
```

## Contributing
Small pull requests are welcome. For major changes, please open an issue first to discuss the changes you'd like to make.

## License
[MIT License](https://choosealicense.com/licenses/mit/)

Copyright (c) 2021 EnderShadow8

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

