/**
 * The per-component preview structure (2026-08-19, Kushagra).
 *
 * One shape for every component, no exceptions: six sections in one fixed order, and a
 * section a component does not have is DECLARED absent with a written reason — the renderer
 * prints the reason, so absence is visible and deliberate, never forgotten. The order is the
 * audit's own: read the size axis first, then states, then the material board over the
 * standard beds, then the crosses, then tone, then the component doing its real job.
 *
 * A spec file is data plus JSX — no hooks at module scope, because the registry is imported
 * by the server route for its slugs as well as by the client pages for its bodies. A live
 * demo that needs state is its own client component, referenced from the spec.
 */
import type * as React from "react";

/** Either rendered specimens, or a written reason the section does not apply. */
export type PreviewSection = { body: React.ReactNode; absent?: never } | { absent: string; body?: never };

export type SectionKey = "sizes" | "states" | "materials" | "permutations" | "tones" | "inUse";

/** The fixed order. The renderer walks THIS list — a spec cannot reorder or skip. */
export const SECTION_ORDER: readonly { key: SectionKey; name: string }[] = [
  { key: "sizes", name: "Sizes" },
  { key: "states", name: "States" },
  { key: "materials", name: "Materials" },
  { key: "permutations", name: "Permutations" },
  { key: "tones", name: "Tones" },
  { key: "inUse", name: "In use" },
];

export type ComponentPreview = {
  /** Route segment: /preview/<slug>. Matches the component reference's slug. */
  slug: string;
  name: string;
  sections: Record<SectionKey, PreviewSection>;
};
