/**
 * The canon, as DATA (ENGINEERING §1.1 — the system is data, code is a small interpreter).
 *
 * One entry per chapter. This single array is the navigation tree, the route table, the
 * previous/next chain and the subject of the coverage laws; the chapter pages are one
 * renderer over it. That is the same shape the component reference, the builder catalog and
 * the preview registry already have, for the same reason: a second list is a second thing to
 * keep in step, and this repo's failures are overwhelmingly two homes for one fact.
 *
 * METADATA LIVES HERE, NOT IN FRONTMATTER, and that is a decision (LOG 2026-08-21). Chapter
 * ORDER has to be authored — a directory listing cannot express it — so a registry exists
 * either way, and frontmatter beside it would be a second home for the same fields. Keeping
 * it in TypeScript also means `tsc` checks it: the component reference caught a documented
 * prop that had never existed exactly this way, and a markdown site would have shipped that
 * sentence.
 */
import type * as React from "react";
import type { MDXComponents } from "mdx/types";

import Installation from "../../content/start/installation.mdx";
import Theming from "../../content/start/theming.mdx";
import YourFirstScreen from "../../content/start/your-first-screen.mdx";
import WhyKookieExists from "../../content/philosophy/why-kookie-exists.mdx";
import TheKindsOfThings from "../../content/philosophy/the-kinds-of-things.mdx";
import WhyTheseRulesHold from "../../content/philosophy/why-these-rules-hold.mdx";
import Composition from "../../content/patterns/composition.mdx";
import Forms from "../../content/patterns/forms.mdx";
import Modality from "../../content/patterns/modality.mdx";
import Navigation from "../../content/patterns/navigation.mdx";
import Feedback from "../../content/patterns/feedback.mdx";
import Color from "../../content/foundations/color.mdx";
import Typography from "../../content/foundations/typography.mdx";
import SpaceAndLayout from "../../content/foundations/space-and-layout.mdx";
import SizeChapter from "../../content/foundations/size.mdx";
import Radius from "../../content/foundations/radius.mdx";
import Materials from "../../content/foundations/materials.mdx";
import Depth from "../../content/foundations/depth.mdx";
import Motion from "../../content/foundations/motion.mdx";
import States from "../../content/foundations/states.mdx";
import Responsiveness from "../../content/foundations/responsiveness.mdx";

export type SectionId = "start" | "philosophy" | "foundations" | "patterns";

export type Section = {
  id: SectionId;
  title: string;
  /** What the whole section is for. Shown on the section's own index and in search. */
  blurb: string;
};

export const SECTIONS: readonly Section[] = [
  {
    id: "start",
    title: "Getting started",
    blurb: "Install the package, stand up a theme, and compose the first screen.",
  },
  {
    id: "philosophy",
    title: "Philosophy",
    blurb: "What this system believes, and the kinds of things it says exist.",
  },
  {
    id: "foundations",
    title: "Foundations",
    blurb: "Colour, type, space, size, material, depth, motion — the decisions everything else is made of.",
  },
  {
    id: "patterns",
    title: "Patterns",
    blurb: "Recurring functional structures, and how this system composes them.",
  },
];

export type Chapter = {
  /** The URL, and the registry's key: `<section>/<name>`. */
  slug: string;
  title: string;
  section: SectionId;
  /** One sentence: what a reader gets from this chapter. Used on section indexes, in the
      previous/next chain and as the page description. */
  blurb: string;
  /**
   * The DECISIONS.md sections this chapter publishes. The docs are a re-voicing of an
   * existing canon rather than new thinking, so a chapter that cites nothing is either a
   * chapter about nothing or a decision that never made it into the spec — the coverage law
   * treats both as failures and resolves every reference against the real document.
   */
  spec: string[];
  /** Path INSIDE `content/`. The table of contents is read from this file's source and the
      laws walk it; the `content/` prefix lives in `toc.ts` so Turbopack can scope the read
      to a subfolder rather than tracing the whole project into the server bundle. */
  source: string;
  /**
   * The compiled chapter.
   *
   * Typed with its `components` prop rather than as a bare `ComponentType`, because that prop
   * is real and a law depends on it: `next build` wires the mapping automatically through
   * `mdx-components.tsx`, but the suite mounts chapters directly and has to hand the mapping
   * over itself. A bare type would make the law's own render a type error, which is how a
   * mechanism ends up asserted by a cast.
   */
  Content: React.ComponentType<{ components?: MDXComponents }>;
};

export const CHAPTERS: readonly Chapter[] = [
  {
    slug: "start/installation",
    title: "Installation",
    section: "start",
    blurb:
      "The package, one stylesheet, a Theme at the root, and the pre-paint script that makes dark mode arrive without a flash.",
    spec: ["§5", "§13"],
    source: "start/installation.mdx",
    Content: Installation,
  },
  {
    slug: "start/theming",
    title: "Theming",
    section: "start",
    blurb:
      "Seven app-level identities stated once at the root — what this app is made of, how close its rhythm is, whether its world has light.",
    spec: ["§5", "§12"],
    source: "start/theming.mdx",
    Content: Theming,
  },
  {
    slug: "start/your-first-screen",
    title: "Your first screen",
    section: "start",
    blurb:
      "One ordinary settings panel, built end to end, and an inventory of everything you never had to decide.",
    spec: ["§3", "§15"],
    source: "start/your-first-screen.mdx",
    Content: YourFirstScreen,
  },

  {
    slug: "philosophy/why-kookie-exists",
    title: "Why Kookie exists",
    section: "philosophy",
    blurb:
      "The loss function, and the argument that a design system is a taxonomy before it is a component library.",
    spec: ["THESIS §1", "THESIS §2", "THESIS §3", "THESIS §4", "THESIS §5", "THESIS §6"],
    source: "philosophy/why-kookie-exists.mdx",
    Content: WhyKookieExists,
  },
  {
    slug: "philosophy/the-kinds-of-things",
    title: "The kinds of things",
    section: "philosophy",
    blurb:
      "Grounds, surfaces, controls, marks, rows and instruments — the taxonomy that decides what each component can be asked.",
    spec: ["THESIS §2", "THESIS §3", "§9", "§10", "§11"],
    source: "philosophy/the-kinds-of-things.mdx",
    Content: TheKindsOfThings,
  },
  {
    slug: "philosophy/why-these-rules-hold",
    title: "Why these rules hold",
    section: "philosophy",
    blurb:
      "Which of these guidelines are unexpressible to violate, which are checked by a failing build, and which are honestly just taste.",
    spec: ["ENGINEERING §1", "ENGINEERING §6", "THESIS §4"],
    source: "philosophy/why-these-rules-hold.mdx",
    Content: WhyTheseRulesHold,
  },

  {
    slug: "foundations/color",
    title: "Colour",
    section: "foundations",
    blurb:
      "Name what a thing means and let the theme resolve the pigment — ten generated families, a solved ink ladder, and one conformance surface.",
    spec: ["§7", "§11"],
    source: "foundations/color.mdx",
    Content: Color,
  },
  {
    slug: "foundations/typography",
    title: "Typography",
    section: "foundations",
    blurb:
      "One ramp shared by Text and Heading, where the visual step and the document level are separate questions on purpose.",
    spec: ["§15", "§17"],
    source: "foundations/typography.mdx",
    Content: Typography,
  },
  {
    slug: "foundations/space-and-layout",
    title: "Space and layout",
    section: "foundations",
    blurb:
      "Components own no outer spacing, and every distance between them answers to a container that knows what the relationship is.",
    spec: ["§3", "§12"],
    source: "foundations/space-and-layout.mdx",
    Content: SpaceAndLayout,
  },
  {
    slug: "foundations/size",
    title: "Size",
    section: "foundations",
    blurb:
      "An index, never a measurement — and the same numeral means different things on different ladders, deliberately.",
    spec: ["§4", "§16"],
    source: "foundations/size.mdx",
    Content: SizeChapter,
  },
  {
    slug: "foundations/radius",
    title: "Radius",
    section: "foundations",
    blurb:
      "The corner is an app-level identity, not a per-component choice, and every band holds a fraction of the box it is actually on.",
    spec: ["§6"],
    source: "foundations/radius.mdx",
    Content: Radius,
  },
  {
    slug: "foundations/materials",
    title: "Materials",
    section: "foundations",
    blurb:
      "What the app is built of — one value for the whole scope, expressed only where something passes behind a pane.",
    spec: ["§10"],
    source: "foundations/materials.mdx",
    Content: Materials,
  },
  {
    slug: "foundations/depth",
    title: "Depth",
    section: "foundations",
    blurb:
      "Elevation is not a component-level choice. Whether this world has light in it is one statement, made once, by the app.",
    spec: ["§5", "§11"],
    source: "foundations/depth.mdx",
    Content: Depth,
  },
  {
    slug: "foundations/motion",
    title: "Motion",
    section: "foundations",
    blurb:
      "Two clocks: paint is a signal and lands on the first frame, geometry is physics and rides a spring.",
    spec: ["§8"],
    source: "foundations/motion.mdx",
    Content: Motion,
  },
  {
    slug: "foundations/states",
    title: "States and interaction",
    section: "foundations",
    blurb:
      "One state machine every control shares, resolved in the stylesheet, with no JavaScript running on hover, press or focus.",
    spec: ["§8", "§9"],
    source: "foundations/states.mdx",
    Content: States,
  },
  {
    slug: "foundations/responsiveness",
    title: "Responsiveness",
    section: "foundations",
    blurb:
      "Adapting the interaction model to the human in front of the screen, which is a different job from reflowing a layout.",
    spec: ["§2", "§17", "§18"],
    source: "foundations/responsiveness.mdx",
    Content: Responsiveness,
  },

  {
    slug: "patterns/composition",
    title: "Composition",
    section: "patterns",
    blurb:
      "The house style: one focal action, differentiated rhythm, a type ladder, and tone used as vocabulary rather than decoration.",
    spec: ["§15", "§11"],
    source: "patterns/composition.mdx",
    Content: Composition,
  },
  {
    slug: "patterns/forms",
    title: "Forms",
    section: "patterns",
    blurb:
      "Labelled values and one action that commits them — with labels as siblings, validity as state, and no field louder than the next.",
    spec: ["§11", "§15"],
    source: "patterns/forms.mdx",
    Content: Forms,
  },
  {
    slug: "patterns/modality",
    title: "Modality",
    section: "patterns",
    blurb:
      "The ladder of interruption, and the difference between a surface summoned to host your work and one that comes at you with a question.",
    spec: ["§24", "§25"],
    source: "patterns/modality.mdx",
    Content: Modality,
  },
  {
    slug: "patterns/navigation",
    title: "Navigation",
    section: "patterns",
    blurb:
      "The app frame as a pattern rather than a component, and which shape it takes at each window class.",
    spec: ["§26", "§27", "§18"],
    source: "patterns/navigation.mdx",
    Content: Navigation,
  },
  {
    slug: "patterns/feedback",
    title: "Feedback",
    section: "patterns",
    blurb:
      "The four things an interface has to say — busy, progress, outcome and error — and which component answers each.",
    spec: ["§11", "§8"],
    source: "patterns/feedback.mdx",
    Content: Feedback,
  },
];

export const BY_SLUG = new Map(CHAPTERS.map((chapter) => [chapter.slug, chapter]));

export const chaptersIn = (section: SectionId) =>
  CHAPTERS.filter((chapter) => chapter.section === section);

/** Reading order across the whole canon — sections in declared order, chapters in declared
    order within each. What previous/next walks. */
export const READING_ORDER: readonly Chapter[] = SECTIONS.flatMap((section) =>
  chaptersIn(section.id),
);

export function neighbours(slug: string): {
  prev?: Chapter | undefined;
  next?: Chapter | undefined;
} {
  const index = READING_ORDER.findIndex((chapter) => chapter.slug === slug);
  if (index === -1) return {};
  return {
    prev: READING_ORDER[index - 1],
    next: READING_ORDER[index + 1],
  };
}
