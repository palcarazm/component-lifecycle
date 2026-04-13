import { LifecycleState } from "./enums/LifecycleState";
import { ComponentOptions } from "./types/ComponentOptions";
import { BaseEventMap, LifecycleEventMap } from "./types/LifecycleEvent";
/**
 * Abstract class representing a component in a web application.
 * 
 * @template P The prefix used for event names. Default: `"component"`.
 * @template TEventMap The type of the event map. Default: {@link BaseEventMap}.
 * @template TOptions The type of the options object. Default: {@link ComponentOptions}.
 */

export abstract class Component<P extends string = "component",
    TEventMap extends BaseEventMap<P> = BaseEventMap<P>,
    TOptions extends ComponentOptions = ComponentOptions> {
    protected abstract readonly PREFIX:P;
    private _state: LifecycleState = LifecycleState.Idle;
    protected readonly options: TOptions;

    /**
     * Constructor for Component.
     *
     * @param {HTMLElement} element - The DOM element this component is attached to.
     * @param {Partial<TOptions>} [options] - Optional configuration object.
     */
    constructor(
    public readonly element: HTMLElement,
    options?: Partial<TOptions>,
    ) {
        const defaultOptions = (this.constructor as typeof Component).getDefaultOptions();

        this.options = { ...defaultOptions, ...options } as TOptions;
    }

    /**
     * Returns the default options for this component class.
     * 
     * @returns The default options configuration
     * 
     * @remarks
     * Subclasses should override this method if they add custom options.
     * Always call `super.getDefaultOptions()` and spread the result.
     * 
     * @example
     * ```typescript
     * type CustomOptions = ExtendableComponentOptions<{ customOption: string }>;
     * export  class CustomOptionsComponent extends Component<
     *     "custom-options",
     *     LifecycleEventMap<"custom-options">,
     *     CustomOptions> {
     *     protected readonly PREFIX = "custom-options";
     *     
     *     protected static getDefaultOptions(): CustomOptions {
     *         return {
     *             ...super.getDefaultOptions(),
     *             customOption: "custom value"
     *         };
     *     }
     * }
     * ```
     */
    protected static getDefaultOptions(): ComponentOptions {
        return DEFAULT_OPTIONS;
    }

    /**
     * Returns the current lifecycle state of this component.
     *
     * @returns {LifecycleState} The current lifecycle state of this component.
     */
    get state() {
        return this._state;
    }
    
    /**
     * Whether this component is in the idle lifecycle state.
     *
     * @returns {boolean} Whether this component is in the idle lifecycle state.
     */
    isIdle() {
        return this._state === LifecycleState.Idle;
    }
    
    /**
     * Whether this component is in the initialized lifecycle state.
     *
     * @returns {boolean} Whether this component is in the initialized lifecycle state.
     */
    isInitialized() {
        return this._state === LifecycleState.Initialized;
    }
    
    /**
     * Whether this component is in the attached lifecycle state.
     *
     * @returns {boolean} Whether this component is in the attached lifecycle state.
     */
    isAttached() {
        return this._state === LifecycleState.Attached;
    }
    
    /**
     * Whether this component is in the disposed lifecycle state.
     *
     * @returns {boolean} Whether this component is in the disposed lifecycle state.
     */
    isDisposed() {
        return this._state === LifecycleState.Disposed;
    }
    
    /**
     * Whether this component is in the destroyed lifecycle state.
     *
     * @returns {boolean} Whether this component is in the destroyed lifecycle state.
     */
    isDestroyed() {
        return this._state === LifecycleState.Destroyed;
    }

    /**
     * Checks whether a transition to the given lifecycle state is valid.
     *
     * Transition is valid if the current lifecycle state is included in the
     * array of valid transitions for the given lifecycle state.
     *
     * @param {LifecycleState} next The lifecycle state to transition to.
     *
     * @returns {boolean} Whether the transition is valid.
     */
    protected canTransition(next: LifecycleState): boolean {
        return VALID_TRANSITIONS[this._state].includes(next);
    }

    /**
     * Transitions the component to the given lifecycle state.
     *
     * If the transition is invalid, the component remains in its current lifecycle state.
     * Awaits the corresponding lifecycle hook before completing the transition.
     * If the hook returns `{ cancelled: true }`, the transition is abandoned.
     *
     * @param {LifecycleState} next The lifecycle state to transition to.
     * @returns {Promise<void>} A promise that resolves when the transition is complete.
     * @remarks Fires:
     * - `initialized` If the component transitions to the initialized lifecycle state.
     * - `attached` If the component transitions to the attached lifecycle state.
     * - `disposed` If the component transitions to the disposed lifecycle state.
     * - `destroyed` If the component transitions to the destroyed lifecycle state.
     * - `transition-cancelled` If the transition is cancelled by a lifecycle hook.
     */
    protected async transitionTo(next: LifecycleState): Promise<void> {
        if (!this.canTransition(next)) return;

        switch (next) {
        case LifecycleState.Initialized:
            await this.executeTransition(next, () => this.doInit(), "initialized");
            return;
        case LifecycleState.Attached:
            await this.executeTransition(next, () => this.doAttach(), "attached");
            return;
        case LifecycleState.Disposed:
            await this.executeTransition(next, () => this.doDispose(), "disposed");
            return;
        case LifecycleState.Destroyed:
            await this.executeTransition(next, () => this.doDestroy(), "destroyed");
            return;
        }
    }

    /**
     * Executes a lifecycle state transition, running the associated hook and
     * emitting the corresponding lifecycle event if the transition succeeds.
     *
     * @internal Internal helper: it is **not** a generic event emitter wrapper.
     *   It is only used for lifecycle-driven transitions.
     * @template K extends keyof LifecycleEventMap<P>
     *   The lifecycle event name to emit after a successful transition.
     * @param toState The target lifecycle state to move into.
     * @param hook The lifecycle hook to execute before committing the transition.
     *   If the hook returns `{ cancelled: true }`, the transition is aborted
     *   and a `"transition-cancelled"` event is emitted instead.
     * @param eventName The lifecycle event to emit when the transition completes successfully.
     * @returns A promise that resolves once the transition have completed.
     */
    private async executeTransition<K extends keyof LifecycleEventMap<P>>(
        toState: LifecycleState,
        hook: () => Promise<{ cancelled: boolean; reason?: string }>,
        eventName: K & string
    ): Promise<void> {
        const hookResult = await hook();
        if (hookResult.cancelled) {
            this.emit("transition-cancelled", {
                component: this,
                from: this._state,
                to: toState,
                reason: hookResult.reason
            });
            return;
        }
        this._state = toState;
        this.emit(eventName, { component: this });
    }

    /**
     * Initializes the component.
     *
     * Transitions the component to the initialized lifecycle state.
     * Implementation notes:
     * - This method should not be overridden by subclasses. To perform additional initialization tasks, override the `doInit()` method.
     * - This method should be called when the component is ready to be initialized.
     * @returns {Promise<void>} A promise that resolves when the initialization is complete.
     * @remarks Fires `initialized` If the component transitions to the initialized lifecycle state.
     */
    async init(): Promise<void> {
        await this.transitionTo(LifecycleState.Initialized);
    }
    
    /**
     * Attaches the component to the DOM.
     *
     * Transitions the component to the attached lifecycle state.
     * Implementation notes:
     * - This method should not be overridden by subclasses. To perform additional attachment tasks, override the `doAttach()` method.
     * - This method should be called when the component is ready to be attached.
     * @returns {Promise<void>} A promise that resolves when the attachment is complete.
     * @remarks Fires `attached` If the component transitions to the attached lifecycle state.
     */
    async attach(): Promise<void> {
        await this.transitionTo(LifecycleState.Attached);
    }
    
    /**
     * Disposes the component.
     *
     * Transitions the component to the disposed lifecycle state.
     * Implementation notes:
     * - This method should not be overridden by subclasses. To perform additional disposal tasks, override the `doDispose()` method.
     * - This method should be called when the component is ready to be disposed.
     * @returns {Promise<void>} A promise that resolves when the disposal is complete.
     * @remarks Fires `disposed` If the component transitions to the disposed lifecycle state.
     */
    async dispose(): Promise<void> {
        await this.transitionTo(LifecycleState.Disposed);
    }
    
    /**
     * Destroys the component.
     *
     * Transitions the component to the destroyed lifecycle state.
     * Implementation notes:
     * - This method should not be overridden by subclasses. To perform additional destruction tasks, override the `doDestroy()` method.
     * - This method should be called when the component is ready to be destroyed.
     * @returns {Promise<void>} A promise that resolves when the destruction is complete.
     * @remarks Fires `destroyed` If the component transitions to the destroyed lifecycle state.
     */
    async destroy(): Promise<void> {
        await this.transitionTo(LifecycleState.Destroyed);
    }

    /**
     * Hooks that are called when the component transitions to the initialized lifecycle state.
     * 
     * Implementation notes:
     * - Can be overridden by subclasses to perform additional initialization tasks.
     * - If async operations are needed, return a promise that resolves when complete.
     * - Return `{ cancelled: true, reason: "..." }` to prevent the transition.
     * 
     * @returns {Promise<{ cancelled: boolean; reason?: string }>} A promise that resolves to an object with `cancelled` flag and optional `reason`.
     */
    protected async doInit(): Promise<{ cancelled: boolean; reason?: string }> {
        return { cancelled: false };
    }

    /**
     * Hooks that are called when the component transitions to the attached lifecycle state.
     * 
     * Implementation notes:
     * - Can be overridden by subclasses to perform additional attachment tasks.
     * - If async operations are needed, return a promise that resolves when complete.
     * - Return `{ cancelled: true, reason: "..." }` to prevent the transition.
     * 
     * @returns {Promise<{ cancelled: boolean; reason?: string }>} A promise that resolves to an object with `cancelled` flag and optional `reason`.
     */
    protected async doAttach(): Promise<{ cancelled: boolean; reason?: string }> {
        return { cancelled: false };
    }

    /**
     * Hooks that are called when the component transitions to the disposed lifecycle state.
     * 
     * Implementation notes:
     * - Can be overridden by subclasses to perform additional disposal tasks.
     * - If async operations are needed, return a promise that resolves when complete.
     * - Return `{ cancelled: true, reason: "..." }` to prevent the transition.
     * 
     * @returns {Promise<{ cancelled: boolean; reason?: string }>} A promise that resolves to an object with `cancelled` flag and optional `reason`.
     */
    protected async doDispose(): Promise<{ cancelled: boolean; reason?: string }> {
        return { cancelled: false };
    }

    /**
     * Hooks that are called when the component transitions to the destroyed lifecycle state.
     * 
     * Implementation notes:
     * - Can be overridden by subclasses to perform additional destruction tasks.
     * - If async operations are needed, return a promise that resolves when complete.
     * - Return `{ cancelled: true, reason: "..." }` to prevent the transition.
     * 
     * @returns {Promise<{ cancelled: boolean; reason?: string }>} A promise that resolves to an object with `cancelled` flag and optional `reason`.
     */
    protected async doDestroy(): Promise<{ cancelled: boolean; reason?: string }> {
        return { cancelled: false };
    }

    /**
     * Emits a custom event with the given name and detail.
     *
     * @template K The type of the event to be emitted.
     * @param name The name of the event to be emitted.
     * @param detail The detail of the event to be emitted.
     *
     * @remarks
     * - The event name will be prefixed with the component's prefix.
     * - Events bubble to the document by default (bubbles: true) unless the component was instantiated with `bubbleEvents: false`.
     */
    protected emit<K extends keyof TEventMap>(
        name: K & string,
        detail: TEventMap[K],
    ) {
        const eventName = `${this.PREFIX}:${name}`;
        const event: Event = new CustomEvent(eventName, {
            detail,
            bubbles: this.options.bubbleEvents,
        });
        this.element.dispatchEvent(event);
    }

    /**
     * Listens for the given lifecycle event and calls the provided handler when it is emitted.
     *
     * @template K The type of the event to be listened for.
     * @param name The name of the event to be listened for.
     * @param handler The handler to be called when the event is emitted.
     *
     * @returns This component instance.
     */
    on<K extends keyof TEventMap>(
        name: `${P}:${K & string}`,
        handler: (ev: CustomEvent<TEventMap[K]>) => void,
    ) {
        this.element.addEventListener(name, handler as EventListener);
        return this;
    }

    /**
     * Listens for the given lifecycle event and calls the provided handler when it is emitted, only once.
     *
     * @template K The type of the event to be listened for.
     * @param name The name of the event to be listened for.
     * @param handler The handler to be called when the event is emitted.
     *
     * @returns This component instance.
     */
    once<K extends keyof TEventMap>(
        name: `${P}:${K & string}`,
        handler: (ev: CustomEvent<TEventMap[K]>) => void,
    ) {
        this.element.addEventListener(name, handler as EventListener, {
            once: true,
        });
        return this;
    }

    /**
     * Stops listening for the given lifecycle event.
     *
     * @template K The type of the event to stop listening for.
     * @param name The name of the event to stop listening for.
     * @param handler The handler to stop calling when the event is emitted.
     *
     * @returns This component instance.
     */
    off<K extends keyof TEventMap>(
        name: `${P}:${K & string}`,
        handler: (ev: CustomEvent<TEventMap[K]>) => void,
    ) {
        this.element.removeEventListener(name, handler as EventListener);
        return this;
    }
}

/**
 * Default options for the {@link Component} class according to {@link ComponentOptions}.
 * @internal Not part of public API. Use `Component.getDefaultOptions()` for extensibility.
 */
const DEFAULT_OPTIONS: ComponentOptions = {
    bubbleEvents: true,
};

/**
 * Valid transitions for each lifecycle state.
 */
const VALID_TRANSITIONS: Record<LifecycleState, LifecycleState[]> = {
    [LifecycleState.Idle]:        [LifecycleState.Initialized],
    [LifecycleState.Initialized]: [LifecycleState.Attached],
    [LifecycleState.Attached]:    [LifecycleState.Disposed, LifecycleState.Destroyed],
    [LifecycleState.Disposed]:    [LifecycleState.Attached, LifecycleState.Destroyed],
    [LifecycleState.Destroyed]:   []
};
