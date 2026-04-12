// tests/helpers/DummyComponent.ts
import { Component } from "../../main/Component";
import { ExtendableEventMap, LifecycleEventMap } from "../../main/types/LifecycleEvent";

export class DummyComponent extends Component<"dummy"> {
    protected readonly PREFIX = "dummy";

    public calls: string[] = [];

    protected doInit() { this.calls.push("init"); }
    protected doAttach() { this.calls.push("attach"); }
    protected doDispose() { this.calls.push("dispose"); }
    protected doDestroy() { this.calls.push("destroy"); }
}

export class DefaultComponent extends Component {
    protected readonly PREFIX = "component";
}

type CustomOptions = { bubbleEvents: boolean; customOption: string };
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