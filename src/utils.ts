declare global {
  interface Array<T> {
    filterInPlace(condition: (value: string, index: number, array: string[]) => boolean, thisArg?: any): void
  }
}

Array.prototype.filterInPlace = function(condition: Function, thisArg: any) {
  let j = 0
  this.forEach((v, i) => {
    if(condition.call(thisArg, v, i, this)) {
      if(i !== j) {
        this[j] = v
      }
      j++
    }
  })
  this.length = j
}

export class ECSError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ECSError"
  }
}

export class ComponentError extends ECSError {
  constructor(message: string) {
    super(message)
    this.name = "ComponentError"
  }
}
