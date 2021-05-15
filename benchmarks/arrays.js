const n = 1e7

class p {
  constructor() {
    this.foo = 3
  }

  bar() {
    this.foo += 3
  }
}

console.log("begin")
const prot = new Array(n).fill().map(() => new p())
console.log("prot")
const func = new Array(n).fill().map(() => ({foo: 4, bar() {this.foo += 3}}))
console.log("func")
const nofunc = new Array(n).fill().map(() => ({foo: 4, bar: 3}))
console.log("nofunc")

console.time("prot")
for(let i = 0; i < n; i++) {
  prot[i].bar()
}
console.timeEnd("prot")

console.time("func")
for(let i = 0; i < n; i++) {
  func[i].bar()
}
console.timeEnd("func")

console.time("nofunc")
for(let i = 0; i < n; i++) {
  nofunc[i].foo += nofunc[i].bar
}
console.timeEnd("nofunc")
