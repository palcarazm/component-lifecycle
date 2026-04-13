/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="jest" />
import { Monitor } from "../main/Monitor";
import { CustomEventsComponent, DummyComponent, TransitionFailedComponent } from "./helpers/DummyComponent";
import { LifecycleState } from "../main/enums/LifecycleState";
import { LogLevels } from "../main/enums/LogLevels";

describe("Monitor", () => {
    let element: HTMLElement;
    let component: DummyComponent;
    let monitor: Monitor<"dummy">;

    let consoleDebugSpy: jest.SpyInstance;
    let consoleInfoSpy: jest.SpyInstance;
    let consoleWarnSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        element = globalThis.document.createElement("div");
        globalThis.document.body.append(element);
        component = new DummyComponent(element);
        monitor = new Monitor("dummy");
        
        consoleDebugSpy = jest.spyOn(console, "debug").mockImplementation(() => {});
        consoleInfoSpy = jest.spyOn(console, "info").mockImplementation(() => {});
        consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
        consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    });

    afterEach(() => {
        globalThis.document.body.innerHTML = "";

        jest.clearAllMocks();
        element.remove();
        if(monitor?.getLevel() !== undefined) monitor.stop();

        consoleDebugSpy.mockRestore();
        consoleInfoSpy.mockRestore();
        consoleWarnSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    describe("start() and stop()", () => {
        it("start default to ERROR mode", () => {
            monitor.start();
            expect(monitor.getLevel()).toBe("ERROR");
        });

        it("starts and stops correctly", () => {
            monitor.start(LogLevels.DEBUG);
            expect(monitor.getLevel()).toBe("DEBUG");
            monitor.stop();
            expect(monitor.getLevel()).toBe(undefined);
        });

        it("throws on double start", () => {
            monitor.start(LogLevels.DEBUG);
            expect(() => monitor.start()).toThrow("Monitor has already been started. Call stop() before starting again.");
        });

        it("throws on double stop", () => {
            monitor.start(LogLevels.DEBUG);
            monitor.stop();
            expect(() => monitor.stop()).toThrow("Monitor has not been started. Call start() before stopping.");
        });
    });

    describe("setLevel()", () => {
        it("setLevel changes level", () => {
            monitor.start(LogLevels.DEBUG);
            expect(monitor.getLevel()).toBe("DEBUG");

            monitor.setLevel(LogLevels.ERROR);
            expect(monitor.getLevel()).toBe("ERROR");
        });

        it("setLevel with same level does nothing", () => {
            monitor.start();
            monitor.setLevel(LogLevels.DEBUG);
            const removeAllSpy = jest.spyOn(monitor as any, "removeAllListeners");
            
            monitor.setLevel(LogLevels.DEBUG);
            
            expect(removeAllSpy).not.toHaveBeenCalled();
        });

        it("throws when monitor is not started", () => {
            expect(() => monitor.setLevel(LogLevels.DEBUG)).toThrow("Monitor has not been started. Call start() before setting level.");
        });

        it("removes old listeners when level changes", async () => {
            monitor.start();
            
            // Start with DEBUG
            monitor.setLevel(LogLevels.DEBUG);
            await component.init();
            expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
            
            // Switch to ERROR
            consoleDebugSpy.mockClear();
            monitor.setLevel(LogLevels.ERROR);
            await component.attach();
            expect(consoleDebugSpy).not.toHaveBeenCalled();
            
            // Switch back to DEBUG
            monitor.setLevel(LogLevels.DEBUG);
            await component.dispose();
            expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
        });

        it("correctly transitions between all levels", () => {
            monitor.start();
            
            monitor.setLevel(LogLevels.DEBUG);
            expect(monitor.getLevel()).toBe("DEBUG");
            
            monitor.setLevel(LogLevels.INFO);
            expect(monitor.getLevel()).toBe("INFO");
            
            monitor.setLevel(LogLevels.WARN);
            expect(monitor.getLevel()).toBe("WARN");
            
            monitor.setLevel(LogLevels.ERROR);
            expect(monitor.getLevel()).toBe("ERROR");
        });
    });

    describe("ERROR mode", () => {
        it("does not log any events", async () => {
            monitor.start(LogLevels.ERROR);
            
            await component.init();
            await component.attach();
            await component.dispose();
            await component.destroy();
            
            expect(consoleDebugSpy).not.toHaveBeenCalled();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("WARN mode", () => {
        const logLevels = [LogLevels.WARN, LogLevels.INFO, LogLevels.DEBUG];

        it.each(logLevels)("logs transition-invalid events via console.warn on %s log level", async (logLevel) => {
            monitor.start(logLevel);

            await component.attach(); // invalid from Idle
            
            expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                "[Component] dummy:transition-invalid",
                expect.objectContaining({
                    from: LifecycleState.Idle,
                    to: LifecycleState.Attached
                })
            );
        });

        it.each(logLevels)("logs transition-cancelled events via console.warn on %s log level", async (logLevel) => {
            monitor.start(logLevel);

            const failingComponent = new TransitionFailedComponent(element);
            await failingComponent.init(); // will be cancelled
            
            expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                "[Component] dummy:transition-cancelled",
                expect.objectContaining({
                    from: LifecycleState.Idle,
                    to: LifecycleState.Initialized
                })
            );
        });

        it("does not log lifecycle events on WARN mode", async () => {
            monitor.start(LogLevels.WARN);
            
            await component.init();
            await component.attach();
            
            expect(consoleDebugSpy).not.toHaveBeenCalled();
        });
    });

    describe("INFO mode", () => {
        it("does not log lifecycle events on INFO mode", async () => {
            monitor.start(LogLevels.INFO);
            
            await component.init();
            await component.attach();
            
            expect(consoleDebugSpy).not.toHaveBeenCalled();
        });
    });

    describe("DEBUG mode", () => {
        it("logs all lifecycle events via console.debug", async () => {
            monitor.start(LogLevels.DEBUG);
            
            await component.init();
            await component.attach();
            await component.dispose();
            await component.destroy();
            
            expect(consoleDebugSpy).toHaveBeenCalledTimes(4);
            expect(consoleDebugSpy).toHaveBeenCalledWith(
                "[Component] dummy:initialized",
                expect.objectContaining({ component })
            );
            expect(consoleDebugSpy).toHaveBeenCalledWith(
                "[Component] dummy:attached",
                expect.objectContaining({ component })
            );
            expect(consoleDebugSpy).toHaveBeenCalledWith(
                "[Component] dummy:disposed",
                expect.objectContaining({ component })
            );
            expect(consoleDebugSpy).toHaveBeenCalledWith(
                "[Component] dummy:destroyed",
                expect.objectContaining({ component })
            );
        });
    });

    describe("Custom monitor", ()=>{
        it("should be able to create custom monitor", () => {
            class CustomMonitor extends Monitor<"custom-events"> {
                constructor() {
                    super("custom-events");
                }

                protected setupInfo(): void {
                    super.setupInfo();
                    this.on("loading", () => {
                        console.info("Loading...");
                    }).on("loaded", () => {
                        console.info("Loaded!"); 
                    });
                }
            }

            const component = new CustomEventsComponent(element);
            const customMonitor = new CustomMonitor().start(LogLevels.INFO);
            
            component.loadData();

            expect(consoleInfoSpy).toHaveBeenCalledTimes(2);
            expect(consoleInfoSpy).toHaveBeenCalledWith("Loading...");
            expect(consoleInfoSpy).toHaveBeenCalledWith("Loaded!");

            customMonitor.stop();
        });
    });
});