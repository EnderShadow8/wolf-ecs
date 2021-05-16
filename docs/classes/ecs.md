[wolf-ecs](../../README.md) / [Exports](../modules.md) / ECS

# Class: ECS

An object which manages entities, components and systems.

**`export`**

## Table of contents

### Constructors

- [constructor](ecs.md#constructor)

### Properties

- [nextID](ecs.md#nextid)

### Methods

- [addComponent](ecs.md#addcomponent)
- [addSystem](ecs.md#addsystem)
- [createEntity](ecs.md#createentity)
- [createQuery](ecs.md#createquery)
- [destroyEntity](ecs.md#destroyentity)
- [getComponents](ecs.md#getcomponents)
- [removeComponent](ecs.md#removecomponent)
- [tick](ecs.md#tick)

## Constructors

### constructor

\+ **new ECS**(...`components`: *string*[]): [*ECS*](ecs.md)

Creates an instance of ECS.

**`memberof`** ECS

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...components` | *string*[] | Array of component type names |

**Returns:** [*ECS*](ecs.md)

## Properties

### nextID

• **nextID**: *number*= 0

## Methods

### addComponent

▸ **addComponent**(`id`: *number*, `type`: *string*, `cmp?`: *unknown*): [*ECS*](ecs.md)

Adds a component to an Entity.

**`chainable`**

**`memberof`** ECS

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | *number* | Entity ID |
| `type` | *string* | Name of component |
| `cmp?` | *unknown* | Component object |

**Returns:** [*ECS*](ecs.md)

___

### addSystem

▸ **addSystem**(`sys`: [*System*](system.md)): *void*

Adds a system to the ECS.
Systems execute in the order they are added.

**`memberof`** ECS

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sys` | [*System*](system.md) | System to be added |

**Returns:** *void*

___

### createEntity

▸ **createEntity**(`fromObj?`: { [type: string]: *unknown*;  }): *number*

Creates a new Entity attached to the ECS.

**`memberof`** ECS

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fromObj?` | *object* | Object blueprint for the Entity |

**Returns:** *number*

Entity ID

___

### createQuery

▸ **createQuery**(...`types`: *string*[]): Query

Creates a query.
A component name prefixed with `!` will match if an entity does *not* have that component.

**`memberof`** ECS

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...types` | *string*[] | Component types |

**Returns:** Query

Bitmask Query

___

### destroyEntity

▸ **destroyEntity**(`id`: *number*): *void*

Removes all components from an entity, and therefore deregisters it from all systems.
In the future may also mark the ID as reusable.

**`memberof`** ECS

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | *number* |

**Returns:** *void*

___

### getComponents

▸ **getComponents**(`type`: *string*): *unknown*[]

Gets a sparse array of all components of a specified type, indexed by entity ID.

**`memberof`** ECS

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `type` | *string* | Component type |

**Returns:** *unknown*[]

Sparse array of components

___

### removeComponent

▸ **removeComponent**(`id`: *number*, `type`: *string*): [*ECS*](ecs.md)

Removes a Component from an Entity.

**`chainable`**

**`memberof`** ECS

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | *number* | Entity ID |
| `type` | *string* | Component type |

**Returns:** [*ECS*](ecs.md)

___

### tick

▸ **tick**(): *void*

Executes all systems.

**`memberof`** ECS

**Returns:** *void*
