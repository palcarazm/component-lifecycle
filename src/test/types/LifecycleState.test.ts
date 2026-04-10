/// <reference types="jest" />
import { expectTypeOf } from "expect-type";
import { Component } from "../../main/Component";
import { LifecycleEventDetails, LifecycleEventMap } from "../../main/types/LifecycleEvent";

type P = "component";

describe("LifecycleEventDetails<P> type", () => {
    it("component must be Component<P>", () => {
        expectTypeOf<LifecycleEventDetails<P>>().toEqualTypeOf<{
        component: Component<P>;
        }>();
    });

    it("rejects wrong component type", () => {
        // @ts-expect-error testing rejection on invalid type
        const _invalid: LifecycleEventDetails<P> = { component: {} as Component<"foo"> };
    });
});

describe("LifecycleEventMap<P> type", () => {
    it("has all expected keys", () => {
        expectTypeOf<LifecycleEventMap<P>>().toHaveProperty("initialized");
        expectTypeOf<LifecycleEventMap<P>>().toHaveProperty("attached");
        expectTypeOf<LifecycleEventMap<P>>().toHaveProperty("disposed");
        expectTypeOf<LifecycleEventMap<P>>().toHaveProperty("destroyed");
    });

    it("each event contains Component<P>", () => {
        expectTypeOf<LifecycleEventMap<P>["initialized"]>().toEqualTypeOf<{
        component: Component<P>;
        }>();
    });

    it("rejects invalid event key", () => {
        // @ts-expect-error testing rejection on invalid type
        type _Invalid = LifecycleEventMap<P>["foo"];
    });
});
