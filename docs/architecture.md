# Architecture

Component Lifecycle is built around three architectural principles: a generic and extensible base component model, a deterministic lifecycle state machine, and a strongly typed observability layer. Each of these principles is explored in depth in its own section; this page provides a high‑level overview.

## 1. The Base `Component` Class

Every component in the library extends the generic base class:

```ts
class MyComponent extends Component<"prefix"> { … }
```

The generic parameter defines the **static event prefix**, which is used to generate fully typed event names.  
The base class provides the core runtime behavior:

- lifecycle orchestration  
- event emission and subscription  
- state machine enforcement  
- overridable lifecycle hooks  
- introspection utilities  

This class is the foundation upon which all other architectural concepts are built.

## 2. A Deterministic Lifecycle State Machine

Each component follows a strict lifecycle with well‑defined transitions:

```
idle → initialized → attached ↔ disposed → destroyed
```

Key characteristics:

- **Deterministic**: invalid transitions throw descriptive errors.  
- **Reversible segment**: `attached` and `disposed` form a reversible pair, allowing components to be detached and re‑attached safely.  
- **Terminal state**: `destroyed` is final and cannot transition further.  

A detailed explanation of each state and transition is available in **[Lifecycle](lifecycle.md)**.

## 3. Typed Observability

The library exposes a strongly typed event system based on TypeScript template literal types.  
Event names follow the pattern:

```
${prefix}:${eventName}
```

This ensures:

- compile‑time safety  
- predictable event naming  
- autocompletion in editors  
- fully typed event payloads  

The full event model is described in **[Events](events.md)**.
