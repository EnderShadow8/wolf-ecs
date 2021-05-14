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

const bp = Date.now()
for(let i = 0; i < n; i++) {
  prot[i].bar()
}
const ap = Date.now()
console.log(ap - bp)

const bf = Date.now()
for(let i = 0; i < n; i++) {
  func[i].bar()
}
const af = Date.now()
console.log(af - bf)

const bn = Date.now()
for(let i = 0; i < n; i++) {
  nofunc[i].foo += nofunc[i].bar
}
const an = Date.now()
console.log(an - bn)
