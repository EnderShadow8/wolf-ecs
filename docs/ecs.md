# ECS
ECS is the main class exported by WolfECS. It exposes the user API for creating and manipulating entities, components and queries.
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
Defines a component type. A component's pool can be accessed via `ecs.components.componentName`.

This function is chainable.

### Parameters
| Name | Type | Description |
| - | - | - |
| `name`| `string` | Component type name.
| `def` | [`ComponentDef`](component.md#componentdef) | Component shape definition. |

### Returns
`this`

### Example usage
```js
ecs.defineComponent("foo", {foo: types.i32, bar: types.f32})
```
___

## `createQuery`
Creates and returns a [`Query`](query.md). To add a NOT filter, prefix the component's name with `!`.

### Parameters
| Name | Type | Description |
| - | - | - |
| `...types` | `string[]` | Component types to be included in query. |

### Returns
[`Query`](query.md)

### Example usage
```js
const query = ecs.createQuery("foo", "!bar")
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
| `type` | `string` | Component type name. |

### Returns
`this`

### Example usage
```js
ecs.addComponent(0, "foo").addComponent(0, "bar")
```
___

## `removeComponent`
Removes a component from an entity.

This function is chainable.

### Parameters
| Name | Type | Description |
| - | - | - |
| `id` | `number` | Entity ID. |
| `type` | `string` | Component type name. |

### Returns
`this`

### Example usage:
```js
ecs.addComponent(0, "foo").addComponent(0, "bar")
ecs.removeComponent(0, "foo")
```
___

## `components: {[string]: `[`ComponentArray`](component.md#componentarray)`}`
This is an object in which all user-defined components are stored.

### Example usage:
```js
ecs.defineComponent("foo", {bar: types.i32})
const id = ecs.createEntity()
ecs.components.foo.bar[id] = 1
```
