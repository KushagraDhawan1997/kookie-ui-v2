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

export type SectionKey =
  | "sizes"
  | "states"
  | "materials"
  | "permutations"
  | "nesting"
  | "tones"
  | "inUse";

/**
 * The fixed order. The renderer walks THIS list — a spec cannot reorder or skip — and
 * renders each section's INTENT under its heading, so a demo that does not answer its
 * section's sentence is visible as noise on the page itself. The intents were written after
 * the Nesting section drifted through three meanings in a day (2026-08-20, Kushagra: "whats
 * the point of the preview if we keep doing this") — a section with only a NAME invites
 * every demo to improvise; the sentence is the contract a demo either serves or leaves.
 */
export const SECTION_ORDER: readonly { key: SectionKey; name: string; intent: string }[] = [
  {
    key: "sizes",
    name: "Sizes",
    intent: "The size ladder read as a ladder — every index side by side, so an uneven step shows.",
  },
  {
    key: "states",
    name: "States",
    intent: "Every state the component can be in, at every size that changes it — rest to disabled, live where a state needs a pointer.",
  },
  {
    key: "materials",
    name: "Materials",
    intent: "Solid beside every glass thickness, over every standard bed — is the material readable and legible on each ground?",
  },
  {
    key: "permutations",
    name: "Permutations",
    intent: "The crosses no single table holds (size × material × interaction) — hunting for any cell that reads as a different component.",
  },
  {
    key: "nesting",
    name: "Nesting",
    intent: "The component in context: hosting what it typically hosts, hosted where it typically lands — judged for what must NOT change, and self-nesting given an explicit verdict.",
  },
  {
    key: "tones",
    name: "Tones",
    intent: "The tone sweep across every consumer the component has — ink, fill, edge moving together.",
  },
  {
    key: "inUse",
    name: "In use",
    intent: "The component doing its real job beside its neighbours — compositions an app would ship, nothing invented for the demo.",
  },
];

export type ComponentPreview = {
  /** Route segment: /preview/<slug>. Matches the component reference's slug. */
  slug: string;
  name: string;
  sections: Record<SectionKey, PreviewSection>;
};
