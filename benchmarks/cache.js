const n = 1e7

const a = new Uint32Array(n).fill(1)
const a1 = [...Array(n).keys()]
const a2 = []
let j = 0
for(let i = 0; i < n; i++) {
  j = (j + 4000001) % n
}

let x

console.time("nocache")
x = 0
for(let i = 0; i < n; i++) {
  x += a[a2[i]]
}
console.timeEnd("nocache")

console.time("cache")
x = 0
for(let i = 0; i < n; i++) {
  x += a[a1[i]]
}
console.timeEnd("cache")

console.time("nocache")
x = 0
for(let i = 0; i < n; i++) {
  x += a[a2[i]]
}
console.timeEnd("nocache")
