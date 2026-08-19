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

import { CATALOG } from "./catalog";
import type { BuilderNode } from "./model";
import { effectiveProps } from "./serialize";

export type RenderMode = "canvas" | "export";

const impl = (type: string): React.ComponentType<Record<string, unknown>> => {
  const component = (Kookie as unknown as Record<string, unknown>)[type];
  if (!component) throw new Error(`"${type}" is not an export of @kookie-ui/react.`);
  return component as React.ComponentType<Record<string, unknown>>;
};

export function renderNode(n: BuilderNode, mode: RenderMode): React.ReactElement {
  const entry = CATALOG[n.type];
  if (!entry) throw new Error(`Unknown component "${n.type}" — not in the builder catalog.`);
  const Component = impl(n.type);
  const props: Record<string, unknown> = Object.fromEntries(effectiveProps(n));

  if (entry.renderChild) {
    const child = n.children?.[0];
    if (!child) throw new Error(`${n.type} has no child to pass through render.`);
    props.render = renderNode(child, mode);
    return <Component key={n.id} {...props} />;
  }

  if (mode === "canvas" && !entry.phantom) props["data-b-id"] = n.id;

  if (entry.children === "text") {
    return (
      <Component key={n.id} {...props}>
        {n.text ?? ""}
      </Component>
    );
  }
  if (n.children?.length) {
    return (
      <Component key={n.id} {...props}>
        {n.children.map((c) => renderNode(c, mode))}
      </Component>
    );
  }
  return <Component key={n.id} {...props} />;
}
