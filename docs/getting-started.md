# Getting Started

## Installation

```bash
npm install component-lifecycle
```

## Minimal Example
```typescript
import { Component } from "component-lifecycle";

class MyComponent extends Component<"my-component"> {
    protected readonly PREFIX = "my-component";

    protected onInit() {
        console.log("initialized");
    }
}

const element = document.querySelector("#my-element");
const c = new MyComponent(element);

c.init();
```
