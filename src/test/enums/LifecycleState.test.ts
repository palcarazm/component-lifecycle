/// <reference types="jest" />
import { LifecycleState } from "../../main/enums/LifecycleState";

describe("LifecycleState enum", () => {
    it("should contain all expected states", () => {
        expect(LifecycleState.Idle).toBe("idle");
        expect(LifecycleState.Initialized).toBe("initialized");
        expect(LifecycleState.Attached).toBe("attached");
        expect(LifecycleState.Disposed).toBe("disposed");
        expect(LifecycleState.Destroyed).toBe("destroyed");
    });

    it("should not contain unexpected states", () => {
        const values = Object.values(LifecycleState);

        expect(values).toHaveLength(5);
        expect(values).toEqual([
            "idle",
            "initialized",
            "attached",
            "disposed",
            "destroyed"
        ]);
    });

    it("should map keys to string literal values", () => {
        expect(typeof LifecycleState.Idle).toBe("string");
        expect(typeof LifecycleState.Initialized).toBe("string");
        expect(typeof LifecycleState.Attached).toBe("string");
        expect(typeof LifecycleState.Disposed).toBe("string");
        expect(typeof LifecycleState.Destroyed).toBe("string");
    });
});
