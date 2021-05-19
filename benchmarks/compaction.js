function compactForin(a) {
  let j = 0
  for (let i in a) {
    if (typeof a[i] === "number") {
      a[j++] = a[i]
    }
  }
  a.length = j
}

function compactForeach(a) {
  let j = 0
  a.forEach(v => {a[j] = v; j++})
  a.length = j
}

const ar = new Array(100000)
for(let i = 0; i < 50000; i++) {
  ar[Math.floor(Math.random() * 100000)] = 1
}
const ar2 = ar.slice()

console.time("in")
compactForin(ar)
console.timeEnd("in")

console.time("each")
compactForeach(ar2)
console.timeEnd("each")

console.log(ar.length, ar2.length)
