# System
System is the class that implements ECS systems. Systems' only job is to iterate over entities that match a [query]() and perform operations on them.
___

## `execute`
Cleans up the system's parent [`ECS`]() and then executes the system.

### Returns
`void`

### Example usage
```js
const system = ecs.defineSystem(function() {
  doStuff()
}
system.execute()
```
