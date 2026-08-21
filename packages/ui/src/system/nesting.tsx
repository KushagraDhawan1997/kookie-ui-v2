"use client";

/**
 * A card does not go inside a card (§10, §11 — 2026-08-21).
 *
 * A `Card` is an OBJECT with its own plane: opaque, bordered, and in an elevated world it
 * casts. Two of them stacked is an object standing on an object, which states a relationship
 * the system does not have. The composition that is almost always meant is one of two others,
 * and both already ship: a `Surface` inside the card, for a quiet region within one object
 * (the bed under a deploy hook, a code well, a grouped setting); or a `Surface` holding the
 * cards, for several objects on one ground.
 *
 * WHY A RUNTIME GUARD AND NOT A LINT RULE. The nesting that actually happens crosses a
 * component boundary, where nothing static can see it. This site's own component reference
 * shipped it for weeks: the specimen frame renders a `<Card>`, then renders whatever the
 * example exports, and four examples export a card. Neither file contains a nested card.
 * Only the rendered tree does, so only the rendered tree can be asked.
 *
 * WHY A WARNING AND NOT A REFUSAL. Throwing would break a composition at runtime, in
 * production, for a fault that is a design mistake rather than a crash — and it would have to
 * be right about every case on the first try. The package spends its refusals in the type
 * system, where they cost nothing and cannot fire wrongly. Here the honest arrangement is the
 * one Box's containment trap already uses: warn where a human is looking, refuse where a tool
 * can refuse (the builder's grammar cannot express it), and check where a document can be
 * read (the composition reviewer raises it).
 *
 * A `<Theme>` RESETS the mark, which is what keeps portals correct: a menu or a dialog opened
 * from inside a card renders its own bare Theme, so the panel is a new plane and a card inside
 * it is an ordinary card rather than a nested one. The floating panels never set the mark
 * themselves — they wear the card IDENTITY through the surface layer, not the `Card`
 * component — so this costs them nothing either way.
 */
import * as React from "react";

/** Box's own spelling and its own scar: an ABSENT `process` means dev (audit 2026-08-08). */
const DEV = typeof process === "undefined" || process.env?.NODE_ENV !== "production";

const CardContext = React.createContext(false);

/** Marks the subtree as being inside a card. Context only, so it adds no DOM. */
export function CardScope({ children }: { children: React.ReactNode }) {
  return <CardContext.Provider value={true}>{children}</CardContext.Provider>;
}

/** Clears the mark. Theme renders this, so a portalled panel starts on a fresh plane. */
export function CardScopeReset({ children }: { children: React.ReactNode }) {
  return <CardContext.Provider value={false}>{children}</CardContext.Provider>;
}

/** True when the nearest enclosing plane is a `Card` that this Theme has not reset. */
export function useInsideCard(): boolean {
  return React.use(CardContext);
}

/**
 * Warns once per mount when a card renders inside a card. Dev only; the whole body is behind
 * the flag, so a production build carries the context read and nothing else.
 */
export function useNestedCardWarning(nested: boolean): void {
  React.useEffect(() => {
    if (!DEV || !nested) return;
    console.warn(
      "[kookie-ui] A <Card> is rendering inside another <Card>. A card is an object with its " +
        "own plane, so two of them stacked states a relationship the system does not have. " +
        "For a quiet region inside one card, use a <Surface>. For several objects on one " +
        "ground, put the cards in a <Surface> instead of a card.",
    );
  }, [nested]);
}
