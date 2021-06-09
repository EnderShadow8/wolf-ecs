# System
In WolfECS, systems are plain functions defined by the user. However, there are a couple of pitfalls to avoid:
- When iterating over a query's entities, you must use a double for loop:
  - An outer loop to loop over a query's archetypes
  - An inner loop to loop over an archetype's entities
- If you are *adding components, removing components or destroying entities,* then you have to either iterate the array of entities *backwards* or *create a copy* of the array to iterate over. This is because modifying entities also modifies the array being iterated.

## Query
A `Query` exists for the sole purpose of allowing systems to iterate over the correct entities.
___

### `archetypes: Archetype[]`
This property holds an array of all `Archetype`s that match the `Query`.

#### Example usage
```js
function system() {
  for(let archetype of query.archetypes)
    for(let entity of archetype.entities) {
      doStuff(entity)
    }
  }
}
```

## Archetype
An `Archetype` is simply a collection of entities which share exactly the same composition. This makes queries faster as they only have to check against archetypes, not individual entities.
___

### `entities: number[]`
An array of entity IDs that match the archetype.
