"use client";

import * as React from "react";

import type { Emphasis } from "./axes.ts";

/**
 * The rung a nested list takes, and the fact that it IS nested (§15, 2026-09-12).
 *
 * `null` MEANS NOT IN A LIST, and a value means "the list around me rests here" — `size.ts`'s
 * own spelling, for the same reason: a defaulted context cannot be told apart from a list that
 * chose `loud`, which is what makes an inheritance bug invisible rather than merely wrong.
 *
 * IT LIVES IN THE SYSTEM LAYER RATHER THAN IN `list.tsx` BECAUSE THE PORTAL HAS TO RESET IT.
 * React context follows the React tree and a portal is the one place where that tree and the
 * DOM disagree, so a `<List>` inside a Popover, Dialog or Sheet opened from inside a
 * `<ListItem>` read as nested — it stamped no step, no weight and no ink, and then had no `<li>`
 * to inherit a line from: measured, 14px at `line-height: normal` against the 16/24 the same
 * list renders at anywhere else (audit 2026-09-12). `PortalScope` resets it, which is
 * `GlassScope`'s own sentence at the portal (2026-08-16) — what crosses is what the app said,
 * never what the thing behind it happened to be doing.
 *
 * The alternative was for `system/floating.tsx` to import the context out of the component,
 * which inverts the layers and drags a type-family component into every portalling component's
 * graph. A context two layers share is a fact about the system, so it is declared in the system.
 *
 * Render-time only; nothing here runs at interaction time.
 */
export const ListInkContext = React.createContext<Emphasis | null>(null);
