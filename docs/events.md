# Events

Component Lifecycle provides a strongly typed event system based on TypeScript template literal types.  
Every component defines a **static event prefix**, which determines the namespace of all lifecycle events.

## Event Prefix

```ts
protected static readonly PREFIX = "my-component"
```

This prefix is combined with event names to generate fully typed event identifiers:

- `my-component:initialized`
- `my-component:attached`
- `my-component:disposed`
- `my-component:destroyed`

These event names are **not strings you manually maintain** — they are generated and validated at compile time using TypeScript template literal types.

## Event Model
> [!NOTE]
> You can extend this event model in your own components see [Custom Events](#custom-events).

### Lifecycle Events
Each lifecycle transition emits a corresponding event:

| Lifecycle Transition      | Event Name                    | Emitted By |
|---------------------------|-------------------------------|------------|
| `idle → initialized`      | `prefix:initialized`          | `init()`   |
| `initialized → attached`  | `prefix:attached`             | `attach()` |
| `attached → disposed`     | `prefix:disposed`             | `dispose()`|
| `attached → destroyed`    | `prefix:destroyed`            | `destroy()`|
| `disposed → attached`     | `prefix:attached`             | `attach()` |
| `disposed → destroyed`    | `prefix:destroyed`            | `destroy()`|

All events include a **typed payload** (see [LifecycleEventDetails](./api/type-aliases/LifecycleEventDetails.md)).

### Unsuccessful Transition Events
Each unsuccessful transition emits a corresponding event:

| Unsuccessful Transition | Event Name                    | Emitted when                                         |
|-------------------------|-------------------------------|------------------------------------------------------|
| `cancelled`             | `prefix:transition-cancelled` | Transition hook resolves with `{ cancelled: true }`  |

All events include a **typed payload** (see [TransitionEventDetails](./api/type-aliases/TransitionEventDetails.md)).

## Listening to Events

### Chainable Listeners

You can subscribe to events using the `.on()` method:

```ts
myComponent.on("my-component:attached", detail => {
    console.log("Component attached", detail)
  }).on("my-component:disposed", detail => {
    console.log("Component disposed", detail)
  });
```
> [!NOTE]
> - The event name is fully typed — autocompletion will suggest only valid events.
> - `detail.component` is always the instance that emitted the event.
> - Listeners are automatically removed when the component is destroyed.

### One‑time Chainable Listeners

```ts
myComponent.once("my-component:initialized", () => {
    console.log("Initialized only once")
  }).once("my-component:destroyed", () => {
    console.log("Destroyed only once")
  });
```

### Chainable Removing Listeners

```ts
const handlerInitialized = () => console.log("Initialized")
const handlerAttached = () => console.log("Attached")
const handlerDisposed = () => console.log("Disposed")
const handlerDestroyed = () => console.log("Destroyed")

myComponent.once("my-component:initialized", handlerInitialized)
  .on("my-component:attached", handlerAttached)
  .on("my-component:disposed", handlerDisposed)
  .once("my-component:destroyed", handlerDestroyed);

// Later remove some events listeners
myComponent.off("my-component:attached", handlerAttached)
  .off("my-component:disposed", handlerDisposed);
```

## Custom Events
You can extend the event system with your own custom events using the `ExtendableEventMap` helper type. This allows you to add application-specific events while preserving all lifecycle events.

```ts
import { Component, ExtendableEventMap, LifecycleEventDetails } from "component-lifecycle";

// Define your custom event map
type DataEventMap = ExtendableEventMap<"data-component", {
  "data-loaded": { records: number; timestamp: Date };
  "validation-failed": { errors: string[] };
  "user-action": { action: string; userId: string };
}>;

class DataComponent extends Component<"data-component", DataEventMap> {
  protected readonly PREFIX = "data-component";
  
  async loadData() {
    // Type-safe custom event emission
    this.emit("data-loaded", { 
      records: 42, 
      timestamp: new Date() 
    });
    
    // Lifecycle events still work
    this.emit("initialized", { component: this });
  }
  
  validateUser(id: string) {
    const errors: string[] = [];
    if (!id) errors.push("User ID required");
    if (errors.length) {
      this.emit("validation-failed", { errors });
    }
  }
}

const component = new DataComponent(element);

// Type-safe event listening
component.on("data-component:data-loaded", (ev) => {
  console.log(`Loaded ${ev.detail.records} records at ${ev.detail.timestamp}`);
});

component.on("data-component:validation-failed", (ev) => {
  ev.detail.errors.forEach(error => console.error(error));
});
```

> [!NOTE]
> - `ExtendableEventMap<P, TCustom>` automatically includes all lifecycle events
> - Custom events can have any payload shape you need
> - The prefix `P` must match your component's `PREFIX` value
> - Both lifecycle and custom events maintain full type safety

> [!WARNING]
> `ExtendableEventMap<P, TCustom>` prevents you from using event names that conflict with lifecycle events (`initialized`, `attached`, `disposed`, `destroyed`).
> If you try, you'll get a clear TypeScript error message.

### Type Safety Guarantees

The event system provides compile-time type checking:

```ts
// ✅ Correct - matches expected payload
this.emit("data-loaded", { records: 42, timestamp: new Date() });

// ❌ Type error - wrong payload shape
this.emit("data-loaded", { wrong: "shape" });

// ❌ Type error - unknown event name
this.emit("unknown-event", {});
```

## Best Practices

### ✔ Do

- Use events to communicate state changes externally.
- Keep event payloads small and predictable.
- Document custom events in your component’s README or JSDoc.
- Use `ExtendableEventMap` when adding custom events to preserve lifecycle events.
- Define custom event types in interfaces for better reusability.

### ✘ Don’t

- Emit events inside constructors.
- Emit events during invalid lifecycle states.
- Use events for internal logic that should be handled by hooks.
- Omit lifecycle events when extending the event map (use `ExtendableEventMap` to avoid this).
