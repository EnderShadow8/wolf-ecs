const n = 1e8

console.log("begin")
// const bool = new Array(n).fill().map(() => Math.random() > 0.5)
// console.log("bool")
const uint8 = new Uint8Array(Math.floor(n / 8)).map(() => Math.floor(Math.random() * 256))
console.log("uint8")
const uint32 = new Uint32Array(Math.floor(n / 32)).map(() => Math.floor(Math.random() * 2 ** 32))
console.log("uint32")

// const bb = Date.now()
// for(let i = 0; i < bool.length; i++) {
//   if(bool[i] !== bool[i]) {
//     break
//   }
// }
// const ab = Date.now()
// console.log(ab - bb)

const b8 = Date.now()
for(let i = 0; i < uint8.length; i++) {
  if((uint8[i] & uint8[i]) !== uint8[i]) {
    console.log("break8")
    break
  }
}
const a8 = Date.now()
console.log(a8 - b8)

const b32 = Date.now()
for(let i = 0; i < uint32.length; i++) {
  if((uint32[i] & uint32[i]) >>> 0 !== uint32[i]) {
    console.log("break32")
    break
  }
}
const a32 = Date.now()
console.log(a32 - b32)
