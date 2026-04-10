// tests/helpers/DummyComponent.ts
import { Component } from "../../main/Component";

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