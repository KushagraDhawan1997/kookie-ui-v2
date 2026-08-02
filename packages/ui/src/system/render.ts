import type * as React from "react";

/**
 * The element type accepted by every `render` prop (§5).
 *
 * `React.ReactElement` on its own defaults its props to `unknown`, which makes both halves of a
 * merge unusable: `element.props.className` is not readable, and `cloneElement` will not accept
 * the attributes we add. Naming the two props we actually merge, over an open record for the
 * rest, keeps `className` and `style` typed while still permitting the data attributes and DOM
 * props the caller's element has never heard of.
 */
// The `| undefined` is load-bearing under `exactOptionalPropertyTypes`: a merge computes
// `className` and may land on undefined, and an optional property is not the same type as one
// that admits undefined.
export type RenderProps = {
  className?: string | undefined;
  style?: React.CSSProperties | undefined;
} & Record<string, unknown>;

export type RenderElement = React.ReactElement<RenderProps>;
