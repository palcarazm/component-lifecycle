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

## Why can't Monitor see components with `bubbleEvents: false`?

The Monitor listens for events at the `document` level. When a component has `bubbleEvents: false`, its events do not bubble up through the DOM tree and never reach the document. This is intentional behavior that respects the component's configuration.

If you need to monitor a component, either:
- Set `bubbleEvents: true` (default) when creating the component, or
- Use the component's own `.on()` method to listen directly