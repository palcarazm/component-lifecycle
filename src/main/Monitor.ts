import { LogLevels } from "./enums/LogLevels";

/**
 * Monitor class for observing component lifecycle events at the document level.
 * 
 * @template P - The event prefix to monitor. Defaults to "component".
 * 
 * @example
 * ```typescript
 * // Create a monitor for components with prefix "my-component"
 * const monitor = new Monitor("my-component").start();
 * 
 * // Enable debug tracing for entire application: all component events appear in console.
 * monitor.setLevel('DEBUG');
 * 
 * // Switch to production mode (silent)
 * monitor.setLevel('ERROR');
 * 
 * // Check current level
 * const level = monitor.getLevel(); // "ERROR"
 * 
 * // Stopping monitor
 * monitor.stop();
 * ```
 */
export class Monitor<P extends string = "component"> {
    private currentLevel?: LogLevels;
    private readonly prefix: P;
    private readonly activeListeners: Map<string, EventListener> = new Map();

    /**
     * Creates a new Monitor instance for the given event prefix.
     * 
     * @param prefix - The event prefix to monitor (e.g., "component", "my-component")
     */
    constructor(prefix: P) {
        this.prefix = prefix;
    }

    /**
     * Sets the logging level for this monitor.
     * 
     * @param level - The log level to set ("DEBUG", "INFO", "WARN", or "ERROR")
     * 
     * @remarks
     * - `ERROR`: No listeners attached, zero overhead.
     * - `WARN`: Previous level + Listens to transition events (see {@link TransitionEventMap}).
     * - `INFO`: Previous level + (no additional events at this level).
     * - `DEBUG`: Previous level + Listens to all lifecycle events (see {@link LifecycleEventMap}).
     * 
     * When level changes, all existing listeners are removed and new ones are added
     * based on the new level.
     * 
     * @returns The Monitor instance for chaining
     * @throws An error if the monitor has not been started
     */
    setLevel(level: LogLevels): this {
        if (this.currentLevel === undefined) throw new Error("Monitor has not been started. Call start() before setting level.");
        if (this.currentLevel === level) return this; 
        
        this.removeAllListeners();
        this.currentLevel = level;
        this.addListenersForLevel(level);
        return this;
    }

    /**
     * Returns the current logging level.
     * 
     * @returns The current log level or undefined if the monitor is not started
     */
    getLevel(): LogLevels | undefined {
        return this.currentLevel;
    }

    /**
     * Initializes the monitor with the specified log level and attaches the appropriate listeners.
     * @param level The log level to start the monitor with (defaults to ERROR if not specified)
     * @returns The Monitor instance for chaining
     * @throws An error if the monitor has already been started
     */
    start(level: LogLevels = LogLevels.ERROR): this {
        if (this.currentLevel !== undefined) throw new Error("Monitor has already been started. Call stop() before starting again.");
        this.currentLevel = level;
        this.addListenersForLevel(level);
        return this;
    }

    /**
     * Removes all currently active document listeners.
     * 
     * @remarks This method is intended to be called when the monitor is no longer needed to clean up resources.
     * @returns The Monitor instance for chaining
     * @throws An error if the monitor has not been started
     */
    stop(): this {
        if (this.currentLevel === undefined) throw new Error("Monitor has not been started. Call start() before stopping.");
        this.removeAllListeners();
        this.currentLevel = undefined; // Reset level to indicate monitor is stopped
        return this;
    }

    /**
     * Removes all currently active document listeners.
     * 
     * @internal This method is internal and should not be exposed as part of the public API.
     */
    private removeAllListeners(): void {
        for (const [eventName, listener] of this.activeListeners) {
            document.removeEventListener(eventName, listener);
        }
        this.activeListeners.clear();
    }

    /**
     * Adds document listeners based on the specified log level.
     * 
     * @param level - The log level to configure listeners for
     * 
     * @internal This method is internal and should not be exposed as part of the public API.
     */
    private addListenersForLevel(level: LogLevels): void {
        if(level === LogLevels.DEBUG) this.setupDebug();
        if (level === LogLevels.DEBUG || level === LogLevels.INFO) this.setupInfo();
        if (level === LogLevels.DEBUG || level === LogLevels.INFO || level === LogLevels.WARN) this.setupWarn();
        this.setupError(); // Always add error listeners because is the last level
    }

    /**
     * Adds a single document event listener and tracks it.
     * 
     * This method should be use for automatic cleanup of event listeners in level change or stop.
     * 
     * @param eventName - The base event name (without prefix)
     * @param handler - The event handler function
     * @returns The Monitor instance for chaining
     */
    protected on(
        eventName: string, 
        handler: (event: CustomEvent) => void
    ): this {
        const fullEventName = `${this.prefix}:${eventName}`;
        const listener = handler as EventListener;
        document.addEventListener(fullEventName, listener);
        this.activeListeners.set(fullEventName, listener);
        return this;
    }

    /**
     * Hooks that are called to set up debug level listeners.
     * 
     * @remarks This method is intended to be overridden in subclasses calling `super.setupDebug()` to preserve base functionality.
     */
    protected setupDebug(): void {
        this.on("initialized", (event: CustomEvent) => {
            console.debug(`[Component] ${this.prefix}:initialized`, event.detail);
        }).on("attached", (event: CustomEvent) => {
            console.debug(`[Component] ${this.prefix}:attached`, event.detail);
        }).on("disposed", (event: CustomEvent) => {
            console.debug(`[Component] ${this.prefix}:disposed`, event.detail);
        }).on("destroyed", (event: CustomEvent) => {
            console.debug(`[Component] ${this.prefix}:destroyed`, event.detail);
        });
    }

    /**
     * Hooks that are called to set up info level listeners.
     * 
     * @remarks This method is intended to be overridden in subclasses calling `super.setupInfo()` to preserve base functionality.
     */
    protected setupInfo(): void { /* To be implemented in subclasses */ }

    /**
     * Hooks that are called to set up warn level listeners.
     * 
     * @remarks This method is intended to be overridden in subclasses calling `super.setupWarn()` to preserve base functionality.
     */
    protected setupWarn(): void {
        this.on("transition-invalid", (event: CustomEvent) => {
            console.warn(`[Component] ${this.prefix}:transition-invalid`, event.detail);
        }).on("transition-cancelled", (event: CustomEvent) => {
            console.warn(`[Component] ${this.prefix}:transition-cancelled`, event.detail);
        });
    }

    /**
     * Hooks that are called to set up error level listeners.
     * 
     * @remarks This method is intended to be overridden in subclasses calling `super.setupError()` to preserve base functionality.
     */
    protected setupError(): void { /* To be implemented in subclasses */ }
}