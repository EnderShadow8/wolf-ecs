import {ECS} from "../dist/main.js"

const n = 1e6

const ecs = new ECS("pos", "vel")
for(let i = 0; i < n; i++) {
  ecs.createEntity()
  ecs.addComponent(i, "pos", {pos: Math.random()})
  if(i % 2) {
    ecs.addComponent(i, "vel", {vel: Math.random()})
  }
}

const query = ecs.createQuery("pos", "vel")

function MoveSystem() {
  const pos = ecs.getComponents("pos")
  const vel = ecs.getComponents("vel")
  const l = vel.length
  for(let i = 0; i < l; i++) {
    if(ecs.match(i, query)) {
      pos[i].pos += vel[i].vel
    }
  }
}

for(let i = 0; i < 1; i++) {
  console.time("ecs")
  MoveSystem()
  console.timeEnd("ecs")
}
