[wolf-ecs](../README.md) / [Exports](../modules.md) / ECS

# Class: ECS

An object which manages entities, components and systems.

**`export`**

## Table of contents

### Constructors

- [constructor](ecs.md#constructor)

### Properties

- [\_cmp](ecs.md#_cmp)
- [\_dex](ecs.md#_dex)
- [\_dirty](ecs.md#_dirty)
- [\_dirtykeys](ecs.md#_dirtykeys)
- [\_ent](ecs.md#_ent)
- [\_ids](ecs.md#_ids)
- [\_sys](ecs.md#_sys)
- [curID](ecs.md#curid)

### Methods

- [\_clean](ecs.md#_clean)
- [\_match](ecs.md#_match)
- [\_setDirty](ecs.md#_setdirty)
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

Defined in: [src/main.ts:17](https://github.com/EnderShadow8/wolf-ecs/blob/1d5f42e/src/main.ts#L17)

## Properties

### \_cmp

• `Private` **\_cmp**: *unknown*[][]= []

Defined in: [src/main.ts:10](https://github.com/EnderShadow8/wolf-ecs/blob/1d5f42e/src/main.ts#L10)

___

### \_dex

• `Private` **\_dex**: *object*= {}

#### Type declaration

Defined in: [src/main.ts:11](https://github.com/EnderShadow8/wolf-ecs/blob/1d5f42e/src/main.ts#L11)

___

### \_dirty

• `Private` **\_dirty**: *number*[]= []

Defined in: [src/main.ts:14](https://github.com/EnderShadow8/wolf-ecs/blob/1d5f42e/src/main.ts#L14)

___

### \_dirtykeys

• `Private` **\_dirtykeys**: *boolean*[]= []

Defined in: [src/main.ts:15](https://github.com/EnderShadow8/wolf-ecs/blob/1d5f42e/src/main.ts#L15)

___

### \_ent

• `Private` **\_ent**: *Uint32Array*[]= []

Defined in: [src/main.ts:12](https://github.com/EnderShadow8/wolf-ecs/blob/1d5f42e/src/main.ts#L12)

___

### \_ids

• `Private` **\_ids**: *number*[]= []

Defined in: [src/main.ts:16](https://github.com/EnderShadow8/wolf-ecs/blob/1d5f42e/src/main.ts#L16)

___

### \_sys

• `Private` **\_sys**: [*System*](system.md)[]= []

Defined in: [src/main.ts:13](https://github.com/EnderShadow8/wolf-ecs/blob/1d5f42e/src/main.ts#L13)

___

### curID

• **curID**: *number*= 0

Defined in: [src/main.ts:17](https://github.com/EnderShadow8/wolf-ecs/blob/1d5f42e/src/main.ts#L17)

## Methods

### \_clean

▸ `Private` **_clean**(): *void*

Processes any entities that have been flagged as dirty.
Registers and deregisters modified entities from systems.

**`memberof`** ECS

**Returns:** *void*

Defined in: [src/main.ts:152](https://github.com/EnderShadow8/wolf-ecs/blob/1d5f42e/src/main.ts#L152)

___

### \_match

▸ `Private` **_match**(`id`: *number*, `query`: Query): *boolean*

Checks whether an Entity matches a bitmask query.

**`memberof`** ECS

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `id` | *number* | Entity ID |
| `query` | Query | Query |

**Returns:** *boolean*

Boolean representing whether the Entity matches the query

Defined in: [src/main.ts:199](https://github.com/EnderShadow8/wolf-ecs/blob/1d5f42e/src/main.ts#L199)

___

### \_setDirty

▸ `Private` **_setDirty**(`id`: *number*): *void*

Flags an entity as dirty, i.e. modified.

**`memberof`** ECS

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | *number* |

**Returns:** *void*

Defined in: [src/main.ts:138](https://github.com/EnderShadow8/wolf-ecs/blob/1d5f42e/src/main.ts#L138)

___

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

Defined in: [src/main.ts:91](https://github.com/EnderShadow8/wolf-ecs/blob/1d5f42e/src/main.ts#L91)

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

Defined in: [src/main.ts:46](https://github.com/EnderShadow8/wolf-ecs/blob/1d5f42e/src/main.ts#L46)

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

Defined in: [src/main.ts:58](https://github.com/EnderShadow8/wolf-ecs/blob/1d5f42e/src/main.ts#L58)

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

Defined in: [src/main.ts:181](https://github.com/EnderShadow8/wolf-ecs/blob/1d5f42e/src/main.ts#L181)

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

Defined in: [src/main.ts:76](https://github.com/EnderShadow8/wolf-ecs/blob/1d5f42e/src/main.ts#L76)

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

Defined in: [src/main.ts:123](https://github.com/EnderShadow8/wolf-ecs/blob/1d5f42e/src/main.ts#L123)

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

Defined in: [src/main.ts:109](https://github.com/EnderShadow8/wolf-ecs/blob/1d5f42e/src/main.ts#L109)

___

### tick

▸ **tick**(): *void*

Executes all systems.

**`memberof`** ECS

**Returns:** *void*

Defined in: [src/main.ts:218](https://github.com/EnderShadow8/wolf-ecs/blob/1d5f42e/src/main.ts#L218)
