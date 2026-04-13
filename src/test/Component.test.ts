/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="jest" />
import { Component } from "../main/Component";
import { LifecycleState } from "../main/enums/LifecycleState";
import { ExtendableComponentOptions } from "../main/types/ComponentOptions";
import { ExtendableEventMap, BaseEventMap } from "../main/types/LifecycleEvent";
import { CustomEventsComponent, CustomOptionsComponent, DefaultComponent, DummyComponent, TransitionErroredComponent, TransitionFailedComponent } from "./helpers/DummyComponent";

describe("Component lifecycle", () => {
    let element: HTMLElement;
    let component: DummyComponent;

    beforeEach(() => {
        element = globalThis.document.createElement("div");
        globalThis.document.body.append(element);
        component = new DummyComponent(element);
    });

    afterEach(() => {
        jest.clearAllMocks();
        element.remove();
        globalThis.document.body.innerHTML = "";
    });

    describe("Component lifecycle", () => {
        it("initial state is Idle", () => {
            expect(component.state).toBe(LifecycleState.Idle);
            expect(component.isIdle()).toBe(true);
        });

        it("valid transitions update state", async () => {
            await component.init();
            expect(component.state).toBe(LifecycleState.Initialized);

            await component.attach();
            expect(component.state).toBe(LifecycleState.Attached);

            await component.dispose();
            expect(component.state).toBe(LifecycleState.Disposed);

            await component.attach();
            expect(component.state).toBe(LifecycleState.Attached);

            await component.destroy();
            expect(component.state).toBe(LifecycleState.Destroyed);
        });

        it("invalid transitions do NOT change state", async () => {
            await component.attach(); // invalid from Idle
            expect(component.state).toBe(LifecycleState.Idle);

            await component.dispose(); // invalid from Idle
            expect(component.state).toBe(LifecycleState.Idle);

            await component.destroy(); // invalid from Idle
            expect(component.state).toBe(LifecycleState.Idle);
        });

        it("cancelled transitions do NOT change state", async () => {
            const fallingComponent = new TransitionFailedComponent(element);

            (fallingComponent as any)._state = LifecycleState.Idle;
            await fallingComponent.init();
            expect(fallingComponent.state).toBe(LifecycleState.Idle);

            (fallingComponent as any)._state = LifecycleState.Initialized;
            await fallingComponent.attach();
            expect(fallingComponent.state).toBe(LifecycleState.Initialized);

            (fallingComponent as any)._state = LifecycleState.Attached;
            await fallingComponent.dispose();
            expect(fallingComponent.state).toBe(LifecycleState.Attached);

            (fallingComponent as any)._state = LifecycleState.Disposed;
            await fallingComponent.destroy();
            expect(fallingComponent.state).toBe(LifecycleState.Disposed);
        });

        it("errored transitions do NOT change state and rethrow error", async () => {
            const erroredComponent = new TransitionErroredComponent(element);

            (erroredComponent as any)._state = LifecycleState.Idle;
            expect(erroredComponent.init()).rejects.toThrow("Transition Error");
            expect(erroredComponent.state).toBe(LifecycleState.Idle);

            (erroredComponent as any)._state = LifecycleState.Initialized;
            expect(erroredComponent.attach()).rejects.toThrow("Transition Error");
            expect(erroredComponent.state).toBe(LifecycleState.Initialized);

            (erroredComponent as any)._state = LifecycleState.Attached;
            expect(erroredComponent.dispose()).rejects.toThrow("Transition Error");
            expect(erroredComponent.state).toBe(LifecycleState.Attached);

            (erroredComponent as any)._state = LifecycleState.Disposed;
            expect(erroredComponent.destroy()).rejects.toThrow("Transition Error");
            expect(erroredComponent.state).toBe(LifecycleState.Disposed);
        });
    });

    describe("State check methods", () => {
        it("isIdle() returns true only in Idle state", async () => {
            expect(component.isIdle()).toBe(true);
            await component.init();
            expect(component.isIdle()).toBe(false);
        });

        it("isInitialized() returns true only in Initialized state", async () => {
            expect(component.isInitialized()).toBe(false);
            await component.init();
            expect(component.isInitialized()).toBe(true);
            await component.attach();
            expect(component.isInitialized()).toBe(false);
        });

        it("isAttached() returns true only in Attached state", async () => {
            expect(component.isAttached()).toBe(false);
            await component.init();
            expect(component.isAttached()).toBe(false);
            await component.attach();
            expect(component.isAttached()).toBe(true);
        });

        it("isDisposed() returns true only in Disposed state", async () => {
            expect(component.isDisposed()).toBe(false);
            await component.init();
            expect(component.isDisposed()).toBe(false);
            await component.attach();
            expect(component.isDisposed()).toBe(false);
            await component.dispose();
            expect(component.isDisposed()).toBe(true);
        });

        it("isDestroyed() returns true only in Destroyed state", async () => {
            expect(component.isDestroyed()).toBe(false);
            await component.init();
            expect(component.isDestroyed()).toBe(false);
            await component.attach();
            expect(component.isDestroyed()).toBe(false);
            await component.destroy();
            expect(component.isDestroyed()).toBe(true);
        });
    });
   

    describe("Hooks", () => {
        it("hooks are called in correct order", async () => {
            await component.init();
            await component.attach();
            await component.dispose();
            await component.attach();
            await component.destroy();

            expect(component.calls).toEqual([
                "init",
                "attach",
                "dispose",
                "attach",
                "destroy"
            ]);
        });

        it("delegate to abstract implementation when not overridden", async () => {
            const defaultComponent = new DefaultComponent(element);
            const doInitSpy = jest.spyOn(Component.prototype as any, "doInit");
            const doAttachSpy = jest.spyOn(Component.prototype as any, "doAttach");
            const doDisposeSpy = jest.spyOn(Component.prototype as any, "doDispose");
            const doDestroySpy = jest.spyOn(Component.prototype as any, "doDestroy");

            await defaultComponent.init();
            await defaultComponent.attach();
            await defaultComponent.dispose();
            await defaultComponent.destroy();
            
            expect(doInitSpy).toHaveBeenCalledTimes(1);
            expect(doAttachSpy).toHaveBeenCalledTimes(1);
            expect(doDisposeSpy).toHaveBeenCalledTimes(1);
            expect(doDestroySpy).toHaveBeenCalledTimes(1);
        });
    });

    describe("PREFIX", () => { 
        it("prefix is taken from static PREFIX", () => {
            expect(component["PREFIX"]).toBe("dummy");
        });
    });

    describe("EVENTS", () => {
        describe("Event bubbling", () => {
            const documentHandler = jest.fn();
            const elementHandler = jest.fn();

            beforeEach(() => {
                globalThis.document.addEventListener("dummy:initialized", documentHandler);
                element.addEventListener("dummy:initialized", elementHandler);
            });

            afterEach(() => {
                globalThis.document.removeEventListener("dummy:initialized", documentHandler);
                element.removeEventListener("dummy:initialized", elementHandler);
            });

            it("events bubble to document by default", async () => {
                await component.init();
                
                expect(documentHandler).toHaveBeenCalledTimes(1);
                expect(elementHandler).toHaveBeenCalledTimes(1);
            });

            it("events do NOT bubble when bubbleEvents: false", async () => {
                const nonBubblingComponent = new DummyComponent(element, { bubbleEvents: false });
                
                await nonBubblingComponent.init();

                expect(documentHandler).not.toHaveBeenCalled();
                expect(elementHandler).toHaveBeenCalledTimes(1);
            });

            it("events bubble when bubbleEvents: true explicitly set", async () => {
                const explicitBubblingComponent = new DummyComponent(element, { bubbleEvents: true });
                
                await explicitBubblingComponent.init();
                
                expect(documentHandler).toHaveBeenCalledTimes(1);
                expect(elementHandler).toHaveBeenCalledTimes(1);
            });
        });

        describe("Custom events", () => {
            it("should accept custom events via ExtendableEventMap helper", () => {
                const component = new CustomEventsComponent(element);
                const loadingHandler = jest.fn();
                const loadedHandler = jest.fn();
                
                component
                    .on("custom-events:loading", loadingHandler)
                    .on("custom-events:loaded", loadedHandler);
                
                component.loadData();
                
                const expectedLoadingPayload = { detail: { startedAt: expect.any(Date) } };
                expect(loadingHandler).toHaveBeenCalledWith(expect.objectContaining(expectedLoadingPayload));
                
                const expectedLoadedPayload = { detail: { startedAt: expect.any(Date), finishedAt: expect.any(Date), data: expect.any(String) } };
                expect(loadedHandler).toHaveBeenCalledWith(expect.objectContaining(expectedLoadedPayload));
            });

            it("should type-check custom event payloads", () => {
                type CustomEvents = ExtendableEventMap<"typed", {
                    "data-event": { id: number; name: string };
                }>;
                
                class TypedComponent extends Component<"typed", CustomEvents> {
                    protected readonly PREFIX = "typed";
                    
                    wrongEmit() {
                        // @ts-expect-error - wrong payload type
                        this.emit("data-event", { id: "string" }); // Should error
                    }
                }
                
                const _component = new TypedComponent(element);
            });

            it("should reject overlapping event keys", () => {
                type InvalidEvents = ExtendableEventMap<"test", {
                    initialized: { foo: string };
                }>;
                
                // @ts-expect-error TS2344 - Event key "initialized" conflicts with lifecycle event
                class InvalidComponent extends Component<"test", InvalidEvents> {
                    protected readonly PREFIX = "test";
                }
                const _component = new InvalidComponent(element);
            });
        });

        describe("emit()", () => {
            it("emits initialized event", async () => {
                const handler = jest.fn();
                element.addEventListener("dummy:initialized", handler);
                
                await component.init();
                
                expect(handler).toHaveBeenCalledTimes(1);
                expect(handler.mock.calls[0][0].detail.component).toBe(component);
            });
            
            it("emits attached event", async () => {
                const handler = jest.fn();
                element.addEventListener("dummy:attached", handler);

                await component.init();
                await component.attach();
                
                expect(handler).toHaveBeenCalledTimes(1);
            });

            it("emits disposed event", async () => {
                const handler = jest.fn();
                element.addEventListener("dummy:disposed", handler);
                
                await component.init();
                await component.attach();
                await component.dispose();
                
                expect(handler).toHaveBeenCalledTimes(1);
            });
            
            it("emits destroyed event", async () => {
                const handler = jest.fn();
                element.addEventListener("dummy:destroyed", handler);
                
                await component.init();
                await component.attach();
                await component.destroy();
                
                expect(handler).toHaveBeenCalledTimes(1);
            });
        });

        describe("transition-cancelled event", () => {
            it("emits transition-cancelled when doInit returns cancelled", async () => {
                const cancelledComponent = new TransitionFailedComponent(element);
                const handler = jest.fn();
                
                element.addEventListener("dummy:transition-cancelled", handler);
                await cancelledComponent.init();

                const expectedEventDetail = { component: cancelledComponent, from: LifecycleState.Idle, to: LifecycleState.Initialized, reason: undefined };
                expect(handler).toHaveBeenCalledTimes(1);
                expect(handler).toHaveBeenCalledWith(expect.objectContaining({ detail : expectedEventDetail }));
            });

            it("emits transition-cancelled when doAttach returns cancelled", async () => {
                const cancelledComponent = new TransitionFailedComponent(element);
                (cancelledComponent as any)._state = LifecycleState.Initialized;
                const handler = jest.fn();
                
                element.addEventListener("dummy:transition-cancelled", handler);
                await cancelledComponent.attach();
                
                const expectedEventDetail = { component: cancelledComponent, from: LifecycleState.Initialized, to: LifecycleState.Attached, reason: undefined };
                expect(handler).toHaveBeenCalledTimes(1);
                expect(handler).toHaveBeenCalledWith(expect.objectContaining({ detail : expectedEventDetail }));
            });

            it("emits transition-cancelled when doDispose returns cancelled", async () => {
                const cancelledComponent = new TransitionFailedComponent(element);
                (cancelledComponent as any)._state = LifecycleState.Attached;
                const handler = jest.fn();
                
                element.addEventListener("dummy:transition-cancelled", handler);
                await cancelledComponent.dispose();
                
                const expectedEventDetail = { component: cancelledComponent, from: LifecycleState.Attached, to: LifecycleState.Disposed, reason: undefined };
                expect(handler).toHaveBeenCalledTimes(1);
                expect(handler).toHaveBeenCalledWith(expect.objectContaining({ detail : expectedEventDetail }));
            });

            it("emits transition-cancelled when doDestroy returns cancelled", async () => {
                const cancelledComponent = new TransitionFailedComponent(element);
                (cancelledComponent as any)._state = LifecycleState.Disposed;
                const handler = jest.fn();
                
                element.addEventListener("dummy:transition-cancelled", handler);
                await cancelledComponent.destroy();
                
                const expectedEventDetail = { component: cancelledComponent, from: LifecycleState.Disposed, to: LifecycleState.Destroyed, reason: undefined };
                expect(handler).toHaveBeenCalledTimes(1);
                expect(handler).toHaveBeenCalledWith(expect.objectContaining({ detail : expectedEventDetail }));
            });

            it("includes reason in transition-cancelled event when provided", async () => {
                
                const reasonComponent = new TransitionFailedComponent(element, "Data validation failed");
                const handler = jest.fn();
                
                element.addEventListener("dummy:transition-cancelled", handler);
                await reasonComponent.init();
                
                const expectedEventDetail = expect.objectContaining({ reason: "Data validation failed" });
                expect(handler).toHaveBeenCalledTimes(1);
                expect(handler).toHaveBeenCalledWith(expect.objectContaining({ detail : expectedEventDetail }));
            });

            it("should not emit transition-cancelled when transition is successful", async () => {
                const handler = jest.fn();
                element.addEventListener("dummy:transition-cancelled", handler);

                await component.init();
                await component.attach();
                await component.dispose();
                await component.attach();
                await component.destroy();
                
                expect(handler).not.toHaveBeenCalled();
            });
        });

        describe(".on()", () => {        
            it("on() registers event listener", async () => {
                const handler = jest.fn();
                component.on("dummy:attached", handler);
        
                await component.init();
                await component.attach();
                await component.dispose();
                await component.attach();
        
                expect(handler).toHaveBeenCalledTimes(2);
            });
        });

        describe(".once()", () => {    
            it("once() registers a one-time listener", async () => {
                const handler = jest.fn();
                component.once("dummy:attached", handler);

                await component.init();
                await component.attach();
                await component.dispose();
                await component.attach();

                expect(handler).toHaveBeenCalledTimes(1);
            });
        });

        describe(".off()", () => {
            it("off() removes listener", async () => {
                const handler = jest.fn();
                component.on("dummy:attached", handler);
                component.off("dummy:attached", handler);
                
                await component.init();
                await component.attach();
                
                expect(handler).not.toHaveBeenCalled();
            });
        });
    });

    describe("Extensibility", () => {
        it("subclasses can override defaultOptions", () => {
            const customComponent = new CustomOptionsComponent(element);
            
            const options = (customComponent as any).options;

            expect(options.bubbleEvents).toBe(true); // inherited default
            expect(options.customOption).toBe("custom value"); // custom extension
        });

        it("should reject overlapping options keys", () => {
            type InvalidOptions = ExtendableComponentOptions<{
                bubbleEvents: { foo: string };
            }>;
            
            // @ts-expect-error TS2344 - Options key "bubbleEvents" conflicts with component's base option.
            class InvalidComponent extends Component<"test",BaseEventMap<"test">, InvalidOptions> {
                protected readonly PREFIX = "test";
            }
            const _component = new InvalidComponent(element);
        });
    });
});
