/**
 * Options for the {@link Component} class.
 */
export type ComponentOptions = {
  /**
   * Whether events emitted by this component should bubble up through the DOM.
   * @default true
   */
  bubbleEvents: boolean;
};

/**
 * Helper type to extend the component's base options with custom options.
 * Automatically includes all component's base options while allowing additional custom options.
 * 
 * @template TCustom Custom options to merge with component's base options.
 * 
 * @example
 * ```typescript
 * // ✅ Valid - no conflicts
 * type MyOptions = ExtendableComponentOptions<{
 *   "data-url": string;
 * }>;
 * 
 * // ❌ Invalid - 'bubbleEvents' conflicts
 * type InvalidEvents = ExtendableComponentOptions<{ bubbleEvents: {} }>;
 * // Results in: { bubbleEvents: "❌ Option key \"bubbleEvents\" conflicts with component's base option. Use a different name." }
 * ```
 */
export type ExtendableComponentOptions <
  TCustom extends Record<string, unknown> = Record<string, never>
> = NoComponentOptions<TCustom> & Omit<ComponentOptions, keyof TCustom>;

/**
 * Helper type to ensure that custom options do not overlap with component's base options.
 * 
 * @internal Not part of public API.
 * @template TCustom Custom options to merge with base component's base options.
 * @example
 * // ✅ Valid - no conflicts
 * type Valid = NoComponentOptions<{ custom: string }>;
 * 
* // ❌ Invalid - 'bubbleEvents' conflicts
* type Invalid = NoComponentOptions<{ bubbleEvents: {} }>;
* // Results in: { bubbleEvents: "❌ Option key \"bubbleEvents\" conflicts with component's base option. Use a different name." }
 */
type NoComponentOptions<TCustom> =
  keyof TCustom & keyof ComponentOptions extends never
    ? TCustom
    : {
        [K in keyof TCustom]: K extends keyof ComponentOptions
          ? `❌ Option key "${K & string}" conflicts with component's base option. Use a different name.`
          : TCustom[K];
      };