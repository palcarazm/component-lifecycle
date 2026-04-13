import { Component } from "../Component";
import { LifecycleState } from "../enums/LifecycleState";

/**
 * Event details for lifecycle events (e.g., initialized, attached, disposed, destroyed).
 * Reusable type for all lifecycle events.
 * 
 * @template P The prefix used for event names.
 */
export type LifecycleEventDetails<P extends string> = {
  component: Component<P>;
};

/**
 * Map of lifecycle events to event details.
 * 
 * @template P The prefix used for event names.
 */
export type LifecycleEventMap<P extends string> = {
  initialized: LifecycleEventDetails<P>;
  attached: LifecycleEventDetails<P>;
  disposed: LifecycleEventDetails<P>;
  destroyed: LifecycleEventDetails<P>;
};

/**
 * Event details for transition-related events (e.g., transition-cancelled, transition-invalid).
 * Reusable type for all events that include state transition information.
 * 
 * @template P The prefix used for event names.
 */
export type TransitionEventDetails<P extends string> = LifecycleEventDetails<P> & {
  from: LifecycleState;
  to: LifecycleState;
  reason?: string;
};

/**
 * Map of transition events to event details.
 * 
 * @template P The prefix used for event names.
 */
export type TransitionEventMap<P extends string> = {
  "transition-cancelled": TransitionEventDetails<P>;
};

/**
 * Map of all lifecycle and transition events to event details.
 * 
 * @template P The prefix used for event names.
 */
export type BaseEventMap<P extends string> = LifecycleEventMap<P> & TransitionEventMap<P>;


/**
 * Helper type to extend the base event map with custom events.
 * Automatically includes all base events while allowing additional custom events.
 * 
 * @template P The prefix used for event names.
 * @template TCustom Custom event map to merge with base events.
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
 * // Results in: { initialized: "❌ Event key \"initialized\" conflicts with base event. Use a different name." }
 * ```
 */
export type ExtendableEventMap<
  P extends string,
  TCustom extends Record<string, unknown> = Record<string, never>
> = NoBaseEventMap<TCustom, P> & Omit<BaseEventMap<P>, keyof TCustom>;

/**
 * Helper type to ensure that custom event keys do not overlap with base events.
 * 
 * @internal Not part of public API.
 * @template P The prefix used for event names.
 * @template TCustom Custom event map to merge with base events.
 * @example
 * // ✅ Valid - no conflicts
 * type Valid = NoBaseEventMap<{ custom: string }, "mycomp">;
 * 
* // ❌ Invalid - 'initialized' conflicts
* type Invalid = NoBaseEventMap<{ initialized: {} }, "mycomp">;
* // Results in: { initialized: "❌ Event key \"initialized\" conflicts with base event. Use a different name." }
 */
type NoBaseEventMap<TCustom, P extends string> =
  keyof TCustom & keyof BaseEventMap<P> extends never
    ? TCustom
    : {
        [K in keyof TCustom]: K extends keyof BaseEventMap<P>
          ? `❌ Event key "${K & string}" conflicts with base event. Use a different name.`
          : TCustom[K];
      };