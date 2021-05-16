[wolf-ecs](../README.md) / [Exports](../modules.md) / System

# Class: System

A system which performs operations on entities that match a specified query.

**`export`**

## Table of contents

### Constructors

- [constructor](system.md#constructor)

### Properties

- [ecs](system.md#ecs)
- [entities](system.md#entities)
- [execute](system.md#execute)
- [keys](system.md#keys)
- [query](system.md#query)

## Constructors

### constructor

\+ **new System**(`query`: Query, `execute`: () => *void*): [*System*](system.md)

Creates an instance of System.

**`memberof`** System

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | Query |
| `execute` | () => *void* |

**Returns:** [*System*](system.md)

Defined in: [src/main.ts:237](https://github.com/EnderShadow8/wolf-ecs/blob/1d5f42e/src/main.ts#L237)

## Properties

### ecs

• **ecs**: [*ECS*](ecs.md)

Defined in: [src/main.ts:233](https://github.com/EnderShadow8/wolf-ecs/blob/1d5f42e/src/main.ts#L233)

___

### entities

• **entities**: *number*[]= []

Defined in: [src/main.ts:235](https://github.com/EnderShadow8/wolf-ecs/blob/1d5f42e/src/main.ts#L235)

___

### execute

• **execute**: () => *void*

#### Type declaration

▸ (): *void*

**Returns:** *void*

Defined in: [src/main.ts:237](https://github.com/EnderShadow8/wolf-ecs/blob/1d5f42e/src/main.ts#L237)

___

### keys

• **keys**: *boolean*[]= []

Defined in: [src/main.ts:236](https://github.com/EnderShadow8/wolf-ecs/blob/1d5f42e/src/main.ts#L236)

___

### query

• **query**: Query

Defined in: [src/main.ts:234](https://github.com/EnderShadow8/wolf-ecs/blob/1d5f42e/src/main.ts#L234)
