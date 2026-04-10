# FAQ

## Why use a static prefix?

To ensure event names are:

- predictable
- type‑safe
- autocompletable

## Why separate `dispose()` and `destroy()`?

Because they represent different responsibilities:

- `dispose()` → release resources
- `destroy()` → remove DOM and fully tear down the component