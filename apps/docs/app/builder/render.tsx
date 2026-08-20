/**
 * The interpreter (2026-08-19): a document node rendered as the real component, nothing in
 * between. Two modes, one derivation — `effectiveProps` is shared with the serializer, so
 * what the canvas shows and what the export states cannot disagree about a prop.
 *
 * "canvas" additionally stamps `data-b-id` on every node that renders an element of its
 * own, which is the whole selection mechanism: the canvas root listens once, walks up to
 * the nearest stamp, and no component grows an editor prop. Entries marked `phantom`
 * (state-only roots like Menu) and `renderChild` triggers (whose element IS their child's)
 * stamp nothing — the tree view is how those are selected.
 *
 * "export" renders clean, and exists for one consumer: the round-trip law compiles the
 * exported code and asserts its markup is byte-identical to this mode's.
 */

import * as React from "react";

import * as Kookie from "@kookie-ui/react";

import { CATALOG, slotsFor } from "./catalog";
import { flowChildren, slottedChild, type BuilderNode } from "./model";
import { effectiveProps } from "./serialize";

export type RenderMode = "canvas" | "export";

const impl = (type: string): React.ComponentType<Record<string, unknown>> => {
  const component = (Kookie as unknown as Record<string, unknown>)[type];
  if (!component) throw new Error(`"${type}" is not an export of @kookie-ui/react.`);
  return component as React.ComponentType<Record<string, unknown>>;
};

/**
 * The interpreter is a MEMOIZED component, not a bare function (2026-08-20).
 *
 * The document's writes preserve identity for untouched subtrees (model.ts), and this is
 * what turns that into speed: a subtree whose node object did not change does not re-render
 * at all. Measured at 280 nodes: 103ms per keystroke before, 8ms after.
 *
 * `renderNode` keeps its function shape because the laws and the export path call it
 * directly; it just returns this component now.
 */
const NodeView = React.memo(
  function NodeView({ n, mode }: { n: BuilderNode; mode: RenderMode }) {
    return renderNodeInner(n, mode);
  },
  (a, b) => a.n === b.n && a.mode === b.mode,
);

export function renderNode(n: BuilderNode, mode: RenderMode): React.ReactElement {
  return <NodeView key={n.id} n={n} mode={mode} />;
}

function renderNodeInner(n: BuilderNode, mode: RenderMode): React.ReactElement {
  const entry = CATALOG[n.type];
  if (!entry) throw new Error(`Unknown component "${n.type}" — not in the builder catalog.`);
  const Component = impl(n.type);
  const props: Record<string, unknown> = Object.fromEntries(effectiveProps(n));

  // A named seat renders as the prop it is — `leading={<Spinner/>}` — which is the same
  // derivation the serializer writes, so canvas and export cannot disagree about a slot.
  for (const slot of slotsFor(n.type)) {
    const child = slottedChild(n, slot);
    if (child) props[slot] = renderNode(child, mode);
  }

  if (entry.renderChild) {
    const child = flowChildren(n)[0];
    if (!child) throw new Error(`${n.type} has no child to pass through render.`);
    // The RAW element, deliberately not the memoized wrapper: `render` hands Base UI an
    // element it clones its own props onto (the trigger's id, aria-haspopup, ref). Wrapping
    // it in a component swallows all of them — the round-trip law caught exactly that the
    // day this file started memoizing, with a menu trigger that had stopped announcing
    // itself as a menu.
    props.render = renderNodeInner(child, mode);
    return <Component {...props} />;
  }

  if (mode === "canvas" && !entry.phantom) {
    props["data-b-id"] = n.id;
    // Drag-to-move: the canvas element IS the handle. Exempt only components whose own
    // interaction is a drag (the slider's thumb) — native draggable would race the pointer
    // capture. Text drag-selection inside canvas fields is knowingly traded away: canvas
    // text is a specimen, and the inspector is where text is edited.
    if (!entry.dragOwnsPointer) props.draggable = true;
  }

  if (entry.children === "text") {
    return (
      <Component {...props}>
        {n.text ?? ""}
      </Component>
    );
  }
  const kids = flowChildren(n);
  if (kids.length) {
    return (
      <Component {...props}>
        {kids.map((c) => renderNode(c, mode))}
      </Component>
    );
  }
  return <Component {...props} />;
}
