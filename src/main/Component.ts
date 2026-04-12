import { LifecycleState } from "./enums/LifecycleState";
import { ComponentOptions } from "./types/ComponentOptions";
import { LifecycleEventMap } from "./types/LifecycleEvent";
/**
 * Abstract class representing a component in a web application.
 * 
 * @template P The prefix used for event names. Default: `"component"`.
 * @template TEventMap The type of the event map. Default: {@link LifecycleEventMap}.
 * @template TOptions The type of the options object. Default: {@link ComponentOptions}.
 */

export abstract class Component<P extends string = "component",
    TEventMap extends LifecycleEventMap<P> = LifecycleEventMap<P>,
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
     *
     * @param {LifecycleState} next The lifecycle state to transition to.
     *
     * @remarks Fires:
     * - `initialized` If the component transitions to the initialized lifecycle state.
     * - `attached` If the component transitions to the attached lifecycle state.
     * - `disposed` If the component transitions to the disposed lifecycle state.
     * - `destroyed` If the component transitions to the destroyed lifecycle state.
     */
    protected transitionTo(next: LifecycleState) {
        if (!this.canTransition(next)) return;

        this._state = next;

        switch (next) {
        case LifecycleState.Initialized:
            this.doInit();
            this.emit("initialized", { component: this });
            break;

        case LifecycleState.Attached:
            this.doAttach();
            this.emit("attached", { component: this });
            break;

        case LifecycleState.Disposed:
            this.doDispose();
            this.emit("disposed", { component: this });
            break;

        case LifecycleState.Destroyed:
            this.doDestroy();
            this.emit("destroyed", { component: this });
            break;
        }
    }

    /**
     * Initializes the component.
     *
     * Transitions the component to the initialized lifecycle state.
     * Implementation notes:
     * - This method should not be overridden by subclasses. To perform additional initialization tasks, override the `doInit()` method.
     * - This method should be called when the component is ready to be initialized.
     * 
     * @remarks Fires `initialized` If the component transitions to the initialized lifecycle state.
     */
    init() {
        this.transitionTo(LifecycleState.Initialized);
    }
    
    /**
     * Attaches the component to the DOM.
     *
     * Transitions the component to the attached lifecycle state.
     * Implementation notes:
     * - This method should not be overridden by subclasses. To perform additional attachment tasks, override the `doAttach()` method.
     * - This method should be called when the component is ready to be attached.
     *
     * @remarks Fires `attached` If the component transitions to the attached lifecycle state.
     */
    attach() {
        this.transitionTo(LifecycleState.Attached);
    }
    
    /**
     * Disposes the component.
     *
     * Transitions the component to the disposed lifecycle state.
     * Implementation notes:
     * - This method should not be overridden by subclasses. To perform additional disposal tasks, override the `deoDispose()` method.
     * - This method should be called when the component is ready to be disposed.
     *
     * @remarks Fires `disposed` If the component transitions to the disposed lifecycle state.
     */
    dispose() {
        this.transitionTo(LifecycleState.Disposed);
    }
    
    /**
     * Destroys the component.
     *
     * Transitions the component to the destroyed lifecycle state.
     * Implementation notes:
     * - This method should not be overridden by subclasses. To perform additional destruction tasks, override the `doDestroy()` method.
     * - This method should be called when the component is ready to be destroyed.
     *
     * @remarks Fires `destroyed` If the component transitions to the destroyed lifecycle state.
     */
    destroy() {
        this.transitionTo(LifecycleState.Destroyed);
    }

    /**
     * Hooks that are called when the component transitions to the initialized lifecycle state.
     * 
     * Implementation notes:
     * - Can be overridden by subclasses to perform additional initialization tasks.
     */
    protected doInit() {/* no-op, can be overridden by subclasses */}

    /**
     * Hooks that are called when the component transitions to the attached lifecycle state.
     * 
     * Implementation notes:
     * - Can be overridden by subclasses to perform additional initialization tasks.
     */
    protected doAttach() {/* no-op, can be overridden by subclasses */}

    /**
     * Hooks that are called when the component transitions to the disposed lifecycle state.
     * 
     * Implementation notes:
     * - Can be overridden by subclasses to perform additional initialization tasks.
     */
    protected doDispose() {/* no-op, can be overridden by subclasses */}

    /**
     * Hooks that are called when the component transitions to the destroyed lifecycle state.
     * 
     * Implementation notes:
     * - Can be overridden by subclasses to perform additional initialization tasks.
     */
    protected doDestroy() {/* no-op, can be overridden by subclasses */}

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
