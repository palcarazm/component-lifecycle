# Monitoring Component Events

## Base Monitor
The library provides a `Monitor` class for debugging and observability. See the [API documentation](./api/classes/Monitor.md).

```typescript
import { Monitor } from 'component-lifecycle';

// Create a monitor for components with prefix "my-component"
const monitor = new Monitor("my-component").start();

// Enable debug tracing for entire application: all component events appear in console.
monitor.setLevel('DEBUG');

// Switch to production mode (silent)
monitor.setLevel('ERROR');

// Check current level
const level = monitor.getLevel(); // "ERROR"

// Stopping monitor
monitor.stop();
```

> [!IMPORTANT]
> **Components with `bubbleEvents: false` will not be visible to the Monitor.**
> 
> The Monitor listens for events at the `document` level. If a component is configured with `bubbleEvents: false`, its events will not bubble up to the document and therefore will not be captured by the Monitor. This is by design - the Monitor respects the component's event bubbling configuration.

## Custom monitor

You can extend the monitor to handle your custom component events while preserving all base functionality.

```ts
class CustomMonitor extends Monitor<"custom-events"> {
    constructor() {super("custom-events");}

    // Extend the behavior on info mode:
    // - calling super.setupInfo() to preserve base functionality.
    // - using on() to automatic handle tear down on level change and monitor stop.
    protected setupInfo(): void {
        super.setupInfo();
        this.on("loading", () => {
            console.info("Loading...");
        }).on("loaded", () => {
            console.info("Loaded!"); 
        });
    }
}
```