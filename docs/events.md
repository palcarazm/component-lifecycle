# Events

Component Lifecycle provides a strongly typed event system based on TypeScript template literal types.  
Every component defines a **static event prefix**, which determines the namespace of all lifecycle events.

## Event Prefix

```ts
protected static readonly PREFIX = "my-component"
```

This prefix is combined with lifecycle event names to generate fully typed event identifiers:

- `my-component:initialized`
- `my-component:attached`
- `my-component:disposed`
- `my-component:destroyed`

These event names are **not strings you manually maintain** — they are generated and validated at compile time using TypeScript template literal types.

## Event Model

Each lifecycle transition emits a corresponding event:

| Lifecycle Transition      | Event Name                    | Emitted By |
|---------------------------|-------------------------------|------------|
| `idle → initialized`      | `prefix:initialized`          | `init()`   |
| `initialized → attached`  | `prefix:attached`             | `attach()` |
| `attached → disposed`     | `prefix:disposed`             | `dispose()`|
| `disposed → attached`     | `prefix:attached`             | `attach()` |
| `disposed → destroyed`    | `prefix:destroyed`            | `destroy()`|

All events include a **typed payload**, which typically contains:

```ts
{
  component: this
}
```

You can extend this payload in your own components.

## Listening to Events

You can subscribe to events using the `.on()` method:

```ts
myComponent.on("my-component:attached", detail => {
  console.log("Component attached", detail)
})
```
> [!NOTE]
> - The event name is fully typed — autocompletion will suggest only valid events.
> - `detail.component` is always the instance that emitted the event.
> - Listeners are automatically removed when the component is destroyed.


## One‑time Listeners

```ts
myComponent.once("my-component:initialized", () => {
  console.log("Initialized only once")
})
```

## Removing Listeners

```ts
const handler = () => console.log("Detached")

myComponent.on("my-component:disposed", handler)

// Later:
myComponent.off("my-component:disposed", handler)
```


## Best Practices

### ✔ Do

- Use events to communicate state changes externally.
- Keep event payloads small and predictable.
- Document custom events in your component’s README or JSDoc.

### ✘ Don’t

- Emit events inside constructors.
- Emit events during invalid lifecycle states.
- Use events for internal logic that should be handled by hooks.