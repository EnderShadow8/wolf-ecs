[wolf-ecs](../README.md) / [Exports](../modules.md) / ECSError

# Class: ECSError

Error relating to ECS.

**`export`**

## Hierarchy

- *Error*

  ↳ **ECSError**

## Table of contents

### Constructors

- [constructor](ecserror.md#constructor)

### Properties

- [message](ecserror.md#message)
- [name](ecserror.md#name)
- [stack](ecserror.md#stack)

## Constructors

### constructor

\+ **new ECSError**(`message`: *string*): [*ECSError*](ecserror.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | *string* |

**Returns:** [*ECSError*](ecserror.md)

Overrides: Error.constructor

Defined in: [src/main.ts:260](https://github.com/EnderShadow8/wolf-ecs/blob/1d5f42e/src/main.ts#L260)

## Properties

### message

• **message**: *string*

Inherited from: Error.message

Defined in: node_modules/typescript/lib/lib.es5.d.ts:974

___

### name

• **name**: *string*

Inherited from: Error.name

Defined in: node_modules/typescript/lib/lib.es5.d.ts:973

___

### stack

• `Optional` **stack**: *string*

Inherited from: Error.stack

Defined in: node_modules/typescript/lib/lib.es5.d.ts:975
