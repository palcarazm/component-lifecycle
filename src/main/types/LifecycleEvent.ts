import { Component } from "../Component";

export type LifecycleEventDetails<P extends string> = {
  component: Component<P>;
};

export type LifecycleEventMap<P extends string> = {
  initialized: LifecycleEventDetails<P>;
  attached: LifecycleEventDetails<P>;
  disposed: LifecycleEventDetails<P>;
  destroyed: LifecycleEventDetails<P>;
};

/**
 * Helper type to extend the lifecycle event map with custom events.
 * Automatically includes all lifecycle events while allowing additional custom events.
 * 
 * @template P The prefix used for event names.
 * @template TCustom Custom event map to merge with lifecycle events.
 * 
 * @example
 * ```typescript
 * // ✅ Valid - no conflicts
 * type MyEvents = ExtendableEventMap<"mycomp", {
 *   "data-loaded": { records: number };
 *   "validation-failed": { errors: string[] };
 * }>;
 * 
 * class DataComponent extends Component<"mycomp", MyEvents> {
 *   async loadData() {
 *     this.emit("data-loaded", { records: 42 }); // Included by extension
 *     this.emit("initialized", { component: this }); // Included by default
 *   }
 * }
 * 
 * // ❌ Invalid - 'initialized' conflicts
 * type InvalidEvents = ExtendableEventMap<"mycomp", { initialized: {} }>;
 * // Results in: { initialized: "❌ Event key \"initialized\" conflicts with lifecycle event. Use a different name." }
 * ```
 */
export type ExtendableEventMap<
  P extends string,
  TCustom extends Record<string, unknown> = Record<string, never>
> = NoLifecycleKeys<TCustom, P> & Omit<LifecycleEventMap<P>, keyof TCustom>;

/**
 * Helper type to ensure that custom event keys do not overlap with lifecycle events.
 * 
 * @internal Not part of public API.
 * @template P The prefix used for event names.
 * @template TCustom Custom event map to merge with lifecycle events.
 * @example
 * // ✅ Valid - no conflicts
 * type Valid = NoLifecycleKeys<{ custom: string }, "mycomp">;
 * 
* // ❌ Invalid - 'initialized' conflicts
* type Invalid = NoLifecycleKeys<{ initialized: {} }, "mycomp">;
* // Results in: { initialized: "❌ Event key \"initialized\" conflicts with lifecycle event. Use a different name." }
 */
export type NoLifecycleKeys<TCustom, P extends string> =
  keyof TCustom & keyof LifecycleEventMap<P> extends never
    ? TCustom
    : {
        [K in keyof TCustom]: K extends keyof LifecycleEventMap<P>
          ? `❌ Event key "${K & string}" conflicts with lifecycle event. Use a different name.`
          : TCustom[K];
      };