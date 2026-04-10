# Lifecycle

Each component in **Component Lifecycle** follows a deterministic, state‑driven lifecycle.  
The lifecycle is enforced by an internal state machine that validates every transition and emits typed events at each step.

The lifecycle looks like this:
```text
     ┌──────────────┐
     │     idle     │
     └──────────────┘
            │
            │ init()
            ▼
     ┌──────────────┐ 
     │ initialized  │
     └──────────────┘
            │
            │ attach()
            ▼
     ┌──────────────┐    destroy()
     │   attached   │ ──────────────────────┐
     └──────────────┘                       ▼
         ▲      │                    ┌──────────────┐
attach() │      │ dispose()          │  destroyed   │
         │      ▼                    └──────────────┘
     ┌──────────────┐    destroy()          ▲
     │   disposed   │───────────────────────┘
     └──────────────┘
```


- **`idle`** → component is constructed but not initialized  
- **`initialized`** → internal setup is complete, but not attached to the DOM  
- **`attached`** → component is bound to a DOM element and “live”  
- **`disposed`** → component is detached but can be re‑attached  
- **`destroyed`** → component is permanently torn down  

Each transition:

- validates the current state  
- emits a typed event  
- triggers an optional lifecycle hook  

See **[Events](events.md)** for the full event list.

## States and transitions

### `idle`

**Description**

- The component has been constructed (`new MyComponent()`), but no lifecycle method has been called yet.
- No DOM element is associated, no resources should be allocated.

**Allowed transitions**

- `idle → initialized` via `init()`  

**Do**

- Prepare internal configuration that depends on constructor arguments.
- Validate initial options.

**Don’t**

- Access the DOM.
- Register global listeners.
- Start timers or side effects.


### `initialized`

**Description**

- The component has been initialized and is ready to be attached.
- Internal state is consistent, but no DOM binding exists yet.

**Allowed transitions**

- `initialized → attached` via `attach(target: Element)`  

**Do**

- Prepare data needed for rendering or binding.
- Decide which DOM element will be used (but don’t touch it yet).

**Don’t**

- Mutate the DOM.
- Assume the component is visible or interactive.

### `attached`

**Description**

- The component is bound to a DOM element and considered “live”.
- Event listeners, observers, and UI behavior are active.

**Allowed transitions**

- `attached → disposed` via `dispose()`  

**Do**

- Attach DOM event listeners.
- Manipulate the DOM (classes, attributes, children).
- Start timers, observers, or subscriptions.

**Don’t**

- Allocate resources that you never release in `onDispose()` or `onDestroy()`.
- Assume the component will never be detached.

### `disposed`

**Description**

- The component has been detached from the DOM, but it is still reusable.
- It can be re‑attached to the same or a different DOM element.

**Allowed transitions**

- `disposed → attached` via `attach(target: Element)`  
- `disposed → destroyed` via `destroy()`  

**Do**

- Release DOM references that are no longer valid.
- Keep only the minimal state required to re‑attach later.

**Don’t**

- Keep active listeners or timers tied to the old DOM element.
- Assume the component is visible or interactive.

### `destroyed`

**Description**

- The component has been permanently torn down.
- No further lifecycle methods should be called.

**Allowed transitions**

- None (terminal state)

**Do**

- Release all remaining resources.
- Clear references that could cause memory leaks.

**Don’t**

- Call `init()`, `attach()`, or `dispose()` after `destroy()`.
- Expect any further events or hooks to run.

## Lifecycle hooks overview

Each lifecycle method may trigger a corresponding hook:

- `init()` → `onInit()`  
- `attach(target)` → `onAttach(target)`  
- `dispose()` → `onDispose()`  
- `destroy()` → `onDestroy()`  

### Example: implementing hooks correctly

```ts
class Toggle extends Component<"toggle"> {
  protected static readonly PREFIX = "toggle"

  protected onInit(): void {
    // Good: internal setup, no DOM access
    this.state = { active: false }
  }

  protected onAttach(target: Element): void {
    // Good: DOM binding and listeners
    this.button = target as HTMLButtonElement
    this.button.addEventListener("click", this.handleClick)
  }

  protected onDispose(): void {
    // Good: clean up DOM listeners and references
    if (this.button) {
      this.button.removeEventListener("click", this.handleClick)
      this.button = undefined
    }
  }

  protected onDestroy(): void {
    // Good: final cleanup, release any remaining resources
    this.state = undefined
  }

  private handleClick = () => {
    // Component behavior while attached
  }
}
```

**Good practices**

- **`onInit`**: pure internal setup, no DOM.  
- **`onAttach`**: DOM binding, listeners, side effects.  
- **`onDispose`**: undo what `onAttach` did.  
- **`onDestroy`**: final cleanup, nothing should remain referenced.