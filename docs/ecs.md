# ECS
ECS is the main class exported by WolfECS. It exposes the user API for creating and manipulating entities, components, systems and queries.
___

## `constructor`
Creates an instance of ECS.

### Returns
`ECS`

### Example usage
```js
const ecs = new ECS()
```
___

## `defineComponent`
Defines a component type and returns a reference to that component's pool.

### Parameters
| Name | Type | Description |
| - | - | - |
| `def` | [`ComponentDef`](component.md#ComponentDef) | Component shape definition. |

### Returns
[`ComponentArray`](component.md#ComponentArray)

### Example usage
```js
const foo = ecs.defineComponent({foo: types.i32, bar: types.f32})
```
___

## `createQuery`
Creates and returns a [`Query`](query.md) object. To add a NOT filter use the `not` function.

### Parameters
| Name | Type | Description |
| - | - | - |
| `...types` | `ComponentArray[]` | Component types to be included in query. |

### Returns
[`Query`](query.md)

### Example usage
```js
const query = ecs.createQuery(foo, not(bar))
```
___

## `defineSystem`
More info on systems [here](system.md).

Takes a function and binds it to a `System` object which is returned. To execute the system, simply call `System.execute()`.

**DO NOT** call your system's function directly, **IT WILL NOT WORK.** `System.execute()` performs important cleanup tasks to make sure queries behave as expected.

### Parameters
| Name | Type | Description |
| - | - | - |
| `func` | `() => void` | Base function for system. |

### Returns
[`System`](system.md)

### Example usage
```js
const system = ecs.defineSystem(function() {
  doStuff()
})
```
___

## `createEntity`
Creates a new Entity attached to the ECS. Returns the entity ID.

### Returns
`number`

### Example usage
```js
const id = ecs.createEntity()
console.log(id) // Entity ID has been captured
```

___

## `destroyEntity`
Removes all components from an entity. Marks the ID as recyclable.

### Parameters
| Name | Type | Description|
| - | - | - |
| `id` | `number` | Entity ID. |

### Returns
`void`

### Example usage
```js
const id = ecs.createEntity()
ecs.destroyEntity(id)
```
___

## `addComponent`
Adds a component to an Entity. This doesn't set the values for the component's fields - you have to do that manually. It is recommended to define a [factory function](tips.md#factory-functions) to make creating components easier.

This method is chainable.

### Parameters
| Name | Type | Description |
| - | - | - |
| `id` | `number` | Entity ID. |
| `type` | `ComponentArray` | Component type. |

### Returns
`this`

### Example usage
```js
ecs.addComponent(0, foo).addComponent(0, bar)
```
___

## `removeComponent`
Removes a component from an entity.

This function is chainable.

### Parameters
| Name | Type | Description |
| - | - | - |
| `id` | `number` | Entity ID. |
| `type` | [`ComponentArray`](component.md#ComponentArray) | Component type. |

### Returns
`this`

### Example usage:
```js
ecs.addComponent(0, foo).addComponent(0, bar)
ecs.removeComponent(0, foo)
