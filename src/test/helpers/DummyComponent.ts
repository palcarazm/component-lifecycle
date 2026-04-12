// tests/helpers/DummyComponent.ts
import { Component } from "../../main/Component";
import { ExtendableComponentOptions } from "../../main/types/ComponentOptions";
import { ExtendableEventMap, LifecycleEventMap } from "../../main/types/LifecycleEvent";

export class DummyComponent extends Component<"dummy"> {
    protected readonly PREFIX = "dummy";

    public calls: string[] = [];

    protected async doInit() { this.calls.push("init"); return { cancelled: false }; }
    protected async doAttach() { this.calls.push("attach"); return { cancelled: false }; }
    protected async doDispose() { this.calls.push("dispose"); return { cancelled: false }; }
    protected async doDestroy() { this.calls.push("destroy"); return { cancelled: false }; }
}

export class TransitionFailedComponent extends Component<"dummy"> {
    protected readonly PREFIX = "dummy";

    public calls: string[] = [];

    protected async doInit() { this.calls.push("init"); return { cancelled: true }; }
    protected async doAttach() { this.calls.push("attach"); return { cancelled: true }; }
    protected async doDispose() { this.calls.push("dispose"); return { cancelled: true }; }
    protected async doDestroy() { this.calls.push("destroy"); return { cancelled: true }; }
}

export class TransitionErroredComponent extends Component<"dummy"> {
    protected readonly PREFIX = "dummy";

    public calls: string[] = [];
    // @ts-expect-error 2416 - Transition Error for testing
    protected async doInit() { this.calls.push("init"); throw new Error("Transition Error"); }
    // @ts-expect-error 2416 - Transition Error for testing
    protected async doAttach() { this.calls.push("attach"); throw new Error("Transition Error"); }
    // @ts-expect-error 2416 - Transition Error for testing
    protected async doDispose() { this.calls.push("dispose"); throw new Error("Transition Error"); }
    // @ts-expect-error 2416 - Transition Error for testing
    protected async doDestroy() { this.calls.push("destroy"); throw new Error("Transition Error"); }
}

export class DefaultComponent extends Component {
    protected readonly PREFIX = "component";
}

type CustomOptions = ExtendableComponentOptions<{ customOption: string }>;
export  class CustomOptionsComponent extends Component<
    "custom-options", 
    LifecycleEventMap<"custom-options">, 
    CustomOptions> {
    protected readonly PREFIX = "custom-options";
    
    protected static getDefaultOptions(): CustomOptions {
        return {
            ...super.getDefaultOptions(),
            customOption: "custom value"
        };
    }
}

 type CustomEvents = ExtendableEventMap<"custom-events", {
      "loaded": { startedAt: Date, finishedAt: Date, data: string };
      "loading": { startedAt: Date };
    }>;
export class CustomEventsComponent extends Component<"custom-events", CustomEvents> {
    protected readonly PREFIX = "custom-events";

    loadData() {
        const startedAt = new Date();
        this.emit("loading", { startedAt });
        const data = "some data";
        const finishedAt = new Date();
        this.emit("loaded", { startedAt, finishedAt, data });
    }
}