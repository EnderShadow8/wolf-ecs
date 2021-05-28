const n = 1e8

console.time("func")
let x = 0
function f(i) {
  x += i
}
for(let i = 0; i < n; i++) {
  f(i)
}
console.timeEnd("func")

console.time("nofunc")
let y = 0
for(let i = 0; i < n; i++) {
  y += i
}
console.timeEnd("nofunc")

console.log(x)
console.log(y)
