import * as React from "react";

import type { SlotName } from "./axes.ts";

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

/** React's own symbol for a lazy node. Read through `Symbol.for`, which is the registry
    lookup — the same symbol object React created, not a private import. */
const REACT_LAZY = Symbol.for("react.lazy");

/**
 * The element a `render` prop is really pointing at (§5, added 2026-08-06).
 *
 * **An element created in a Server Component and passed across the RSC boundary does not
 * arrive as an element.** React's Flight deserializer wraps it in a lazy node — `$$typeof`
 * is `react.lazy`, `props` is `undefined`, and `isValidElement` is false — so
 * `render.props` threw `Cannot read properties of undefined` and took the whole page down
 * at hydration. It is a known React bug (facebook/react#32392), and its worst property is
 * that it fires in DEVELOPMENT ONLY: the production Flight build hands over a real element,
 * so `next build` was clean while `next dev` could not render a single route. That is how
 * this shipped — the docs app was only ever exercised through `next start`.
 *
 * `React.Children.toArray` is the unwrap, and it is deliberately the whole mechanism: it
 * resolves a lazy child as part of its documented flattening, so this reaches the element
 * through a PUBLIC api rather than by reading `_payload` / `_init` off React's internals.
 * Base UI's own escape carries the identical workaround, citing the identical issue — which
 * is the same contrast the note above draws about merging: where upstream handles a case
 * and we do not, that is a defect of ours, not a house convention.
 *
 * Exported since 2026-08-06, because `composeRender` was not the only reader. A component that
 * hands its `render` straight to Base UI still has to ask the element what it IS — Button
 * infers `nativeButton` from `render.type` — and on a lazy node every such question answers
 * wrong, silently. Anything that inspects or forwards a `render` element goes through here
 * first; the merge is a separate concern below.
 */
export function unwrapLazy(render: RenderElement): RenderElement {
  if ((render as { $$typeof?: symbol } | null)?.$$typeof !== REACT_LAZY) return render;
  return React.Children.toArray(render)[0] as RenderElement;
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
  const target = unwrapLazy(render);
  const own = target.props;
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

  return React.cloneElement(target, next);
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

/**
 * Does this `render` target bottom out in a real `<button>`? (§5, promoted 2026-08-23.)
 *
 * Base UI branches its ENTIRE accessibility contract on `nativeButton`, which defaults to
 * TRUE — so an unforwarded `render={<a href/>}` emits `type="button"` on an anchor (where
 * `type` is the linked resource's MIME type) and, when disabled, an inert `disabled`
 * attribute with no `aria-disabled` and tabindex 0: a focusable, unannounced dead link. That
 * is the 2026-08-03 Button defect, and it has now been shipped four times — Button, Menu
 * (audit 2026-08-09), Dialog/AlertDialog, and Popover (audit 2026-08-23).
 *
 * It RECURSES because the blessed shape is nested: `render={<Button render={<a href/>}/>}` is
 * a component, not an element, so a one-level `type === "button"` check answers wrong and the
 * two components disagree about one node — Button wearing the correct `role="button"` and its
 * host the wrong `type="button"`. Depth-capped at 4 against a cycle.
 *
 * Unwraps at every level (§5): an element created in a Server Component crosses the RSC
 * boundary as a lazy node whose `type` answers wrong, silently (facebook/react#32392).
 *
 * PROMOTED ON ITS FOURTH CONSUMER, exactly as `slot()` was the same day: AlertDialog, Dialog
 * and Menu each carried a byte-identical private copy. `true` is the honest default for a
 * component (we cannot see inside it) — the recursion is what makes that safe.
 *
 * ONE opaque component IS legible: a component handed an `href` is a link by declaration
 * (2026-08-27). The 2026-08-26 flip to default-true re-shipped the anchor defect for the
 * single commonest render target — a router's `<Link>`, which is a function whose inside we
 * cannot see and whose rendered element is an `<a>`. Measured on the docs' own homepage:
 * `render={<Link href/>}` told Base UI "native button" and it warned. The prop is read off
 * the props we DO hold, so no inspection is needed; `nativeButton` stays the escape for a
 * component that takes `href` and renders a button anyway.
 */
export function rootsInButton(el: RenderElement, depth = 0): boolean {
  const target = unwrapLazy(el);
  if (typeof target.type === "string") return target.type === "button";
  const inner = (target.props as { render?: unknown }).render;
  if (depth < 4 && React.isValidElement(inner)) return rootsInButton(inner as RenderElement, depth + 1);
  if ((target.props as { href?: unknown }).href !== undefined) return false;
  return true;
}

/**
 * The slotted-control family's wrapper (ENGINEERING §3, promoted 2026-08-23).
 *
 * One `<span data-slot>` around an adornment, guarded by `filled()` so `{cond && icon}` never
 * rents a gap it will not fill. Every rule that prices a slot keys on the attribute — the icon
 * box, the label-cluster gap, the trailing edge's clearance, the pill's per-side padding, the
 * hosted-control geometry — so the wrapper is the contract rather than a convenience.
 *
 * PROMOTED ON ITS FOURTH CONSUMER, one past due. Button, MenuItem and Row each carried a
 * byte-identical private copy under a comment saying "exactly as Button and MenuItem write
 * it", which is a duplication that had already noticed itself; §21's own rule is that the
 * second member self-keys and the third promotes. `ShellNavItem` gaining slots is what
 * finally made a fourth copy the obvious wrong move.
 */
export function slot(content: React.ReactNode, which: SlotName): React.ReactNode {
  // `createElement` rather than JSX because this file is `.ts`: renaming it to `.tsx` to buy
  // one span would churn every import in the package for no behavioural gain.
  return filled(content) ? React.createElement("span", { "data-slot": which }, content) : null;
}
