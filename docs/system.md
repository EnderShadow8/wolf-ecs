# System
In WolfECS, systems are usually defined using the `defineSystem` function.

## `defineSystem`
Defines a system.

### Parameters
| Name | Type | Description |
| - | - | - |
| `query`| `Query` | Query to be iterated over.
| `func` | `(number) => void` | Function called for each entity. |
| `cleanup?` | `() => void` | Function called after system has finished executing. |

### Returns
`this`

### Example usage
```js
const query = ecs.createQuery("foo")
const system = defineSystem(query, (id) => {
  console.log(ecs.components.foo[id])
}, () => {
  console.log("done")
})
```

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
