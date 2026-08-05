import * as React from "react";

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

/** Both refs get the node. Neither wins, which is the whole point. */
export function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T> {
  return (value: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(value);
      else if (ref) (ref as React.RefObject<T | null>).current = value;
    }
  };
}

/**
 * The `render` escape, merged rather than overwritten (§3, §5, ENGINEERING §5).
 *
 * `cloneElement` special-cases exactly one prop for undefined — `ref` — and copies every other
 * own key of the config even when its value is undefined. Hand-rolled merges therefore lose
 * things silently, and all three of ours lost something different:
 *
 *   Theme  always built a `style` key, so `render={<section style={{minHeight:"100vh"}}/>}`
 *          came back with no style attribute at all, and passed `children` unconditionally,
 *          so a Theme with no children emptied the element it rendered into.
 *   Card   passed `children` unconditionally: `<Card render={<article>Post body</article>}/>`
 *          SSR'd as an empty padded article.
 *   Box    put the ref in unconditionally, and forwardRef (then the wrapper on every component)
 *          hands the function null rather than undefined when no ref was passed — so it was
 *          copied and destroyed the render element's own ref. `<Box render={<div ref={r}/>}/>`
 *          left r.current null forever. The 2026-08-06 React 19 migration retired forwardRef —
 *          a plain ref prop is undefined when absent, which the special case tolerates — but
 *          the merge stays: a PRESENT ref on both sides still needs both to win.
 *
 * Base UI's own escape merges (useRenderElement via useMergedRefs), which is the contrast that
 * makes this a defect rather than a house convention. Consumer values win on `style`, matching
 * §3's rule that an escape which loses to the default is not an escape.
 */
export function composeRender(
  render: RenderElement,
  merged: RenderProps & { ref?: React.Ref<never> | undefined },
  children?: React.ReactNode,
): React.ReactElement {
  const own = render.props;
  const ownRef = (own as { ref?: React.Ref<never> }).ref;
  const next: Record<string, unknown> = {
    ...merged,
    className: [own.className, merged.className].filter(Boolean).join(" ") || undefined,
    style: { ...merged.style, ...own.style },
  };

  // An explicit `children: undefined` is still an own key, and would blank the target.
  if (next.children === undefined) delete next.children;
  if (children !== undefined) next.children = children;
  if (ownRef) next.ref = mergeRefs(merged.ref, ownRef);

  return React.cloneElement(render, next);
}

/**
 * What React would actually PAINT in a slot (§4). The guard `!= null` alone lets the two
 * commonest ways of writing "no adornment" through — `{isSearch && <Icon/>}` evaluates to
 * `false`, and an empty string is what a unit or currency slot holds before the caller has one
 * — and each rendered an empty wrapper that still bought a full gap of dead space beside the
 * content. `0` is content and stays. Shared because every slotted control asks this question,
 * and two copies of the answer had already been written once (TextField, then Button).
 */
export function filled(node: React.ReactNode): boolean {
  return node !== undefined && node !== null && node !== false && node !== true && node !== "";
}
