# Query
A `Query` exists for the sole purpose of allowing systems to iterate over the correct entities.
___

## `entities: number[]`
This property holds an array of all entities that match the `Query`.

### Example usage
```js
const system = ecs.defineSystem(function() {
  for(let entity of query.entities) {
    doStuff(entity)
  }
}
```
