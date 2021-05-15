import {ECS, System} from "../dist/main.js"

const n = 1e5

const ecs = new ECS(
  "pos",
  "vel",
)

const MoveSystem = new System(ecs.createQuery("pos", "vel"), function() {
  const pos = ecs.getComponents("pos")
  const vel = ecs.getComponents("vel")
  for(let i of this.entities) {
    pos[i] += vel[i]
  }
})
ecs.addSystem(MoveSystem)

console.time("creation")
for(let i = 0; i < n; i++) {
  ecs.createEntity()
  ecs.addComponent(i, "pos", 1)
  if(i % 2) {
    ecs.addComponent(i, "vel", 1)
  }
  if(i % 1e5 === 0) {
    console.log(i)
  }
}
console.timeEnd("creation")

for(let i = 0; i < 10; i++) {
  console.time("ecs")
  ecs.tick()
  console.timeEnd("ecs")
}
