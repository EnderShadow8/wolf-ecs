const a = [[1, 2, 3], [4, 5, 6]]
const n = 1e7

console.time("inplace")
let x = 0
for(let i = 0; i < n; i++) {
  for(let j = 0; j < 2; j++) {
    for(let k = 0; k < 3; k++) {
      x += a[j][k]
    }
  }
}
console.timeEnd("inplace")

console.time("arr")
let y = 0
for(let i = 0; i < n; i++) {
  const a2 = []
  for(let j = 0; j < 2; j++) {
    a2.push(...a[j])
  }
  for(let j = 0; j < a2.length; j++) {
    y += a2[j]
  }
}
console.timeEnd("arr")

// console.time("iter")
// let z = 0
// for(let i = 0; i < n; i++) {
//   const iter = {
//     *[Symbol.iterator]() {
//       for(let i = 0; i < 2; i++) {
//         for(let j = 0; j < 3; j++) {
//           yield a[i][j]
//         }
//       }
//     },
//   }
//   for(let i of iter) {
//     y += i
//   }
// }
// console.timeEnd("iter")
