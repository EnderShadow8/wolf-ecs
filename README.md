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
- Components can be any type - no extending, implementing or any of that nonsense.
- Incrementally updated queries and bitmasks for enhanced performance.
- Did I mention it's *[fast](benchmarks/ecs.js)?*

## Usage

Find detailed documentation [here](docs/modules.md).

```js
import {ECS, System} from "./wolf-ecs"

const ecs = new ECS("pos", "vel") // Position and velocity components

// This is a system which updates entities' positions based on their velocity.
const MoveSystem = new System(
  // This is a query that specifies which entities are eligible for this system.
  ecs.createQuery("pos", "vel"),

  // This is the function that is called when "MoveSystem" is executed.
  function() {
    // Get relevant components
    const pos = this.ecs.getComponents("pos")
    const vel = this.ecs.getComponents("vel")

    // Do operations on those components
    for(let i of this.entities) {
      pos[i].x += vel[i].x
      pos[i].y += vel[i].y
    }
  }
)

// Add system to ECS
ecs.addSystem(ExampleSystem)

const id = ecs.createEntity()
ecs.addComponent(
  id,             // Target entity ID
  "pos",          // Component type name
  {x: 0, y: 0}    // Component to be added
)
ecs.addComponent(id, "pos", {x: 1, y: 1})

function main() {
  // And the ECS will handle the rest!
  ecs.tick()
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

