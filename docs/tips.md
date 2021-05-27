# Tips
Some assorted tips for using WolfECS and the ECS paradigm in general.

## Factory functions
Since WolfECS doesn't know what shape your components are going to be, it can't automatically initialise the component's values for you. That doesn't mean you have to set the component values manually though!

For each component you define, write a function which can do the job for you! Even better, with symbol properties, you can attach it directly onto the `ComponentArray` object as a method.

```js
const ecs = new ECS()

const add = Symbol("add")

const component = ecs.defineComponent({foo: types.i32, bar: types.i32})
component[add] = function(id, foo, bar) {
  ecs.addComponent(id, this)
  this.foo[id] = foo
  this.bar[id] = bar
}

// And now you no longer have to set your component fields manually!
const id = ecs.createEntity()
component[add](id, 1, 2)
```

## Tag components
A component with no value is called a tag component. This is useful for systems which only want to act on a certain group of entities which have similar sets of components. For example, a system might be in charge of keyboard control using WASD. Giving an entity a `keyboardControl` tag can tell the system to operate on that entity.

To create a tag component in WolfECS, simply call `ECS.defineComponent` without any arguments:

```js
const tagComponent = ecs.defineComponent()
console.log(tagComponent) // {}
```

## Faster looping
Iteration is a cornerstone of the ECS paradigm. Here are some tips to loop faster.

- `for` is faster than `forEach` which is faster than `for of` which is faster than `for in`.
- Caching: the middle clause of the `for` loop is evaluated every iteration. For a very slight speedup, precompute and cache that value: `for(let i = 0, l = array.length; i < l; i++) {}` Of course, if the operation is more expensive than a simple array length lookup, then caching might produce better results.

However, premature optimisation is bad. Always aim for readability and only optimise with the profiler.
