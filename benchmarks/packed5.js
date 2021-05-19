import {ECS, types} from "../dist/wolf-ecs.js"

const n = 1000

const ecs = new ECS()

const A = ecs.defineComponent(types.Uint32)
const qA = ecs.createQuery(A)
const sysA = ecs.defineSystem(function() {
  for(let i = 0, l = qA.entities.length; i < l; i++) {
    A[qA.entities[i]] *= 2
  }
})

const B = ecs.defineComponent(types.Uint32)
const qB = ecs.createQuery(B)
const sysB = ecs.defineSystem(function() {
  for(let i = 0, l = qB.entities.length; i < l; i++) {
    B[qB.entities[i]] *= 2
  }
})

const C = ecs.defineComponent(types.Uint32)
const qC = ecs.createQuery(C)
const sysC = ecs.defineSystem(function() {
  for(let i = 0, l = qC.entities.length; i < l; i++) {
    C[qC.entities[i]] *= 2
  }
})

const D = ecs.defineComponent(types.Uint32)
const qD = ecs.createQuery(D)
const sysD = ecs.defineSystem(function() {
  for(let i = 0, l = qD.entities.length; i < l; i++) {
    D[qD.entities[i]] *= 2
  }
})

const E = ecs.defineComponent(types.Uint32)
const qE = ecs.createQuery(E)
const sysE = ecs.defineSystem(function() {
  for(let i = 0, l = qE.entities.length; i < l; i++) {
    E[qE.entities[i]] *= 2
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

console.time("Packed_5")
for(let i = 0; i < 100000; i++) {
  sysA.execute()
  sysB.execute()
  sysC.execute()
  sysD.execute()
  sysE.execute()
}
console.timeEnd("Packed_5")
