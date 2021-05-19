import {ECS, types} from "../dist/wolf-ecs.js"

const n = 1000

const ecs = new ECS()

const A = ecs.defineComponent(types.Uint32)
const B = ecs.defineComponent(types.Uint32)

const qA = ecs.createQuery(A)
const qB = ecs.createQuery(B)

const create = ecs.defineSystem(function() {
  for(let i = 0, l = qA.entities.length; i < l; i++) {
    const id = ecs.createEntity()
    ecs.addComponent(id, B)
  }
})
const destroy = ecs.defineSystem(function() {
  for(let i = 0, l = qB.entities.length; i < l; i++) {
    ecs.destroyEntity(qB.entities[i])
  }
})

for(let i = 0; i < n; i++) {
  ecs.createEntity()
  ecs.addComponent(i, A)
  A[i] = 1
}

console.time("Entity_cycle")
for(let i = 0; i < 400; i++) {
  create.execute()
  destroy.execute()
}
console.timeEnd("Entity_cycle")
