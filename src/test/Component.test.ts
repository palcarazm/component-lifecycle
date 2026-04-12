/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="jest" />
import { Component } from "../main/Component";
import { LifecycleState } from "../main/enums/LifecycleState";
import { ExtendableComponentOptions } from "../main/types/ComponentOptions";
import { ExtendableEventMap, LifecycleEventMap } from "../main/types/LifecycleEvent";
import { CustomEventsComponent, CustomOptionsComponent, DefaultComponent, DummyComponent } from "./helpers/DummyComponent";

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

        it("valid transitions update state", () => {
            component.init();
            expect(component.state).toBe(LifecycleState.Initialized);

            component.attach();
            expect(component.state).toBe(LifecycleState.Attached);

            component.dispose();
            expect(component.state).toBe(LifecycleState.Disposed);

            component.attach();
            expect(component.state).toBe(LifecycleState.Attached);

            component.destroy();
            expect(component.state).toBe(LifecycleState.Destroyed);
        });

        it("invalid transitions do NOT change state", () => {
            component.attach(); // invalid from Idle
            expect(component.state).toBe(LifecycleState.Idle);

            component.dispose(); // invalid from Idle
            expect(component.state).toBe(LifecycleState.Idle);

            component.destroy(); // invalid from Idle
            expect(component.state).toBe(LifecycleState.Idle);
        });
    });

    describe("State check methods", () => {
        it("isIdle() returns true only in Idle state", () => {
            expect(component.isIdle()).toBe(true);
            component.init();
            expect(component.isIdle()).toBe(false);
        });

        it("isInitialized() returns true only in Initialized state", () => {
            expect(component.isInitialized()).toBe(false);
            component.init();
            expect(component.isInitialized()).toBe(true);
            component.attach();
            expect(component.isInitialized()).toBe(false);
        });

        it("isAttached() returns true only in Attached state", () => {
            expect(component.isAttached()).toBe(false);
            component.init();
            expect(component.isAttached()).toBe(false);
            component.attach();
            expect(component.isAttached()).toBe(true);
        });

        it("isDisposed() returns true only in Disposed state", () => {
            expect(component.isDisposed()).toBe(false);
            component.init();
            expect(component.isDisposed()).toBe(false);
            component.attach();
            expect(component.isDisposed()).toBe(false);
            component.dispose();
            expect(component.isDisposed()).toBe(true);
        });

        it("isDestroyed() returns true only in Destroyed state", () => {
            expect(component.isDestroyed()).toBe(false);
            component.init();
            expect(component.isDestroyed()).toBe(false);
            component.attach();
            expect(component.isDestroyed()).toBe(false);
            component.destroy();
            expect(component.isDestroyed()).toBe(true);
        });
    });
   

    describe("Hooks", () => {
        it("hooks are called in correct order", () => {
            component.init();
            component.attach();
            component.dispose();
            component.attach();
            component.destroy();

            expect(component.calls).toEqual([
                "init",
                "attach",
                "dispose",
                "attach",
                "destroy"
            ]);
        });

        it("delegate to abstract implementation when not overridden", () => {
            const defaultComponent = new DefaultComponent(element);
            const doInitSpy = jest.spyOn(Component.prototype as any, "doInit");
            const doAttachSpy = jest.spyOn(Component.prototype as any, "doAttach");
            const doDisposeSpy = jest.spyOn(Component.prototype as any, "doDispose");
            const doDestroySpy = jest.spyOn(Component.prototype as any, "doDestroy");

            defaultComponent.init();
            defaultComponent.attach();
            defaultComponent.dispose();
            defaultComponent.destroy();
            
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

            it("events bubble to document by default", () => {
                component.init();
                
                expect(documentHandler).toHaveBeenCalledTimes(1);
                expect(elementHandler).toHaveBeenCalledTimes(1);
            });

            it("events do NOT bubble when bubbleEvents: false", () => {
                const nonBubblingComponent = new DummyComponent(element, { bubbleEvents: false });
                
                nonBubblingComponent.init();

                expect(documentHandler).not.toHaveBeenCalled();
                expect(elementHandler).toHaveBeenCalledTimes(1);
            });

            it("events bubble when bubbleEvents: true explicitly set", () => {
                const explicitBubblingComponent = new DummyComponent(element, { bubbleEvents: true });
                
                explicitBubblingComponent.init();
                
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
            it("emits initialized event", () => {
                const handler = jest.fn();
                element.addEventListener("dummy:initialized", handler);
                
                component.init();
                
                expect(handler).toHaveBeenCalledTimes(1);
                expect(handler.mock.calls[0][0].detail.component).toBe(component);
            });
            
            it("emits attached event", () => {
                const handler = jest.fn();
                element.addEventListener("dummy:attached", handler);

                component.init();
                component.attach();
                
                expect(handler).toHaveBeenCalledTimes(1);
            });

            it("emits disposed event", () => {
                const handler = jest.fn();
                element.addEventListener("dummy:disposed", handler);
                
                component.init();
                component.attach();
                component.dispose();
                
                expect(handler).toHaveBeenCalledTimes(1);
            });
            
            it("emits destroyed event", () => {
                const handler = jest.fn();
                element.addEventListener("dummy:destroyed", handler);
                
                component.init();
                component.attach();
                component.destroy();
                
                expect(handler).toHaveBeenCalledTimes(1);
            });
        });

        describe(".on()", () => {        
            it("on() registers event listener", () => {
                const handler = jest.fn();
                component.on("dummy:attached", handler);
        
                component.init();
                component.attach();
                component.dispose();
                component.attach();
        
                expect(handler).toHaveBeenCalledTimes(2);
            });
        });

        describe(".once()", () => {    
            it("once() registers a one-time listener", () => {
                const handler = jest.fn();
                component.once("dummy:attached", handler);

                component.init();
                component.attach();
                component.dispose();
                component.attach();

                expect(handler).toHaveBeenCalledTimes(1);
            });
        });

        describe(".off()", () => {
            it("off() removes listener", () => {
                const handler = jest.fn();
                component.on("dummy:attached", handler);
                component.off("dummy:attached", handler);
                
                component.init();
                component.attach();
                
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
            class InvalidComponent extends Component<"test",LifecycleEventMap<"test">, InvalidOptions> {
                protected readonly PREFIX = "test";
            }
            const _component = new InvalidComponent(element);
        });
    });
});
