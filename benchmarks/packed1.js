import {ECS, types} from "../dist/wolf-ecs.js"

const n = 5000

const ecs = new ECS()

const A = ecs.defineComponent(types.Uint32)
const B = ecs.defineComponent(types.Uint32)
const C = ecs.defineComponent(types.Uint32)
const D = ecs.defineComponent(types.Uint32)
const E = ecs.defineComponent(types.Uint32)

const q = ecs.createQuery(A)

const sys = ecs.defineSystem(function() {
  for(let i = 0, l = q.entities.length; i < l; i++) {
    A[q.entities[i]] *= 2
  }
})

for(let i = 0; i < n; i++) {
  ecs.createEntity()
  ecs.addComponent(i, A)
  A[i] = 1
  ecs.addComponent(i, B)
  B[i] = 1
  ecs.addComponent(i, C)
  C[i] = 1
  ecs.addComponent(i, D)
  D[i] = 1
  ecs.addComponent(i, E)
  E[i] = 1
}

console.time("Packed_1")
for(let i = 0; i < 100000; i++) {
  sys.execute()
}
console.timeEnd("Packed_1")
