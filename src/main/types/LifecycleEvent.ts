import { Component } from "../Component";

export type LifecycleEventDetails<P extends string> = {
  component: Component<P>;
};

export type LifecycleEventMap<P extends string> = {
  initialized: LifecycleEventDetails<P>;
  attached: LifecycleEventDetails<P>;
  disposed: LifecycleEventDetails<P>;
  destroyed: LifecycleEventDetails<P>;
};