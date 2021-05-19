import {ECS, types} from "../dist/wolf-ecs.js"

const n = 1000

const ecs = new ECS()

const A = ecs.defineComponent(types.Uint32)
const B = ecs.defineComponent(types.Uint32)

const qA = ecs.createQuery(A).mask
const qB = ecs.createQuery(B).mask

ecs._queries = []

const add = ecs.defineSystem(function() {
  for(let i = 0; i < 1000; i++) {
    if(ecs.match(i, qA)) {
      ecs.addComponent(i, B)
    }
  }
})

const remove = ecs.defineSystem(function() {
  for(let i = 0; i < 1000; i++) {
    if(ecs.match(i, qB)) {
      ecs.removeComponent(i, B)
    }
  }
})

for(let i = 0; i < n; i++) {
  ecs.createEntity()
  ecs.addComponent(i, A)
}

console.time("add_remove")
for(let i = 0; i < 1000; i++) {
  add.execute()
  remove.execute()
}
console.timeEnd("add_remove")
