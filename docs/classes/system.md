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

## Properties

### ecs

• **ecs**: [*ECS*](ecs.md)

___

### entities

• **entities**: *number*[]= []

___

### execute

• **execute**: () => *void*

#### Type declaration

▸ (): *void*

**Returns:** *void*

___

### keys

• **keys**: *boolean*[]= []

___

### query

• **query**: Query
