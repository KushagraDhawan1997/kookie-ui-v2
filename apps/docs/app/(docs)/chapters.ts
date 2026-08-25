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
import ComponentFamilies from "../../content/philosophy/component-families.mdx";
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
    blurb: "Install the package, set up a theme, and build your first screen.",
  },
  {
    id: "philosophy",
    title: "Philosophy",
    blurb: "Learn what this system optimizes for, and how it sorts every component into a family.",
  },
  {
    id: "foundations",
    title: "Foundations",
    blurb: "Colour, type, space, size, material, depth and motion. Every other decision in the system is built from these seven.",
  },
  {
    id: "patterns",
    title: "Patterns",
    blurb: "Build the structures that repeat across an app, such as forms, dialogs, navigation and feedback.",
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
      "Add the package to your app, import one stylesheet, and wrap your app in a Theme. You also add a small script so dark mode is correct on the first paint.",
    spec: ["§5", "§13"],
    source: "start/installation.mdx",
    Content: Installation,
  },
  {
    slug: "start/theming",
    title: "Theming",
    section: "start",
    blurb:
      "A Theme sets seven values for your whole app. They control what the app is made of, how tight its spacing is, and whether its surfaces cast light.",
    spec: ["§5", "§12"],
    source: "start/theming.mdx",
    Content: Theming,
  },
  {
    slug: "start/your-first-screen",
    title: "Your first screen",
    section: "start",
    blurb:
      "Build a settings panel from an empty file. Along the way you can see how much of the screen you never had to describe.",
    spec: ["§3", "§15"],
    source: "start/your-first-screen.mdx",
    Content: YourFirstScreen,
  },

  {
    slug: "philosophy/why-kookie-exists",
    title: "Why Kookie exists",
    section: "philosophy",
    blurb:
      "This system sorts components before it styles them. This page explains why that order matters, and what it buys you.",
    spec: ["THESIS §1", "THESIS §2", "THESIS §3", "THESIS §4", "THESIS §5", "THESIS §6"],
    source: "philosophy/why-kookie-exists.mdx",
    Content: WhyKookieExists,
  },
  {
    slug: "philosophy/component-families",
    title: "The component families",
    section: "philosophy",
    blurb:
      "Every component belongs to one of six families: grounds, surfaces, controls, marks, rows and instruments. The family decides which props a component takes.",
    spec: ["THESIS §2", "THESIS §3", "§9", "§10", "§11"],
    source: "philosophy/component-families.mdx",
    Content: ComponentFamilies,
  },
  {
    slug: "philosophy/why-these-rules-hold",
    title: "Why these rules hold",
    section: "philosophy",
    blurb:
      "Some rules here are types you cannot write incorrectly. Some are checked automatically. The rest are judgments, and this page tells you which is which.",
    spec: ["ENGINEERING §1", "ENGINEERING §6", "THESIS §4"],
    source: "philosophy/why-these-rules-hold.mdx",
    Content: WhyTheseRulesHold,
  },

  {
    slug: "foundations/color",
    title: "Colour",
    section: "foundations",
    blurb:
      "Choose what a colour means, and the theme picks the exact value. You get ten families, text colours that always stay readable, and one setting for high contrast.",
    spec: ["§7", "§11"],
    source: "foundations/color.mdx",
    Content: Color,
  },
  {
    slug: "foundations/typography",
    title: "Typography",
    section: "foundations",
    blurb:
      "Text and Heading share one nine-step scale. The step you pick and the heading level you render are two separate choices.",
    spec: ["§15", "§17"],
    source: "foundations/typography.mdx",
    Content: Typography,
  },
  {
    slug: "foundations/space-and-layout",
    title: "Space and layout",
    section: "foundations",
    blurb:
      "A component never sets its own outer spacing. The container sets every distance, because only the container knows how its children relate.",
    spec: ["§3", "§12"],
    source: "foundations/space-and-layout.mdx",
    Content: SpaceAndLayout,
  },
  {
    slug: "foundations/size",
    title: "Size",
    section: "foundations",
    blurb:
      "Every size prop is an index, not a measurement. The same number means different things on a button, a card and a heading.",
    spec: ["§4", "§16"],
    source: "foundations/size.mdx",
    Content: SizeChapter,
  },
  {
    slug: "foundations/radius",
    title: "Radius",
    section: "foundations",
    blurb:
      "One word sets the corner radius for your whole app. Each kind of component then takes a corner that suits the box it is drawn on.",
    spec: ["§6"],
    source: "foundations/radius.mdx",
    Content: Radius,
  },
  {
    slug: "foundations/materials",
    title: "Materials",
    section: "foundations",
    blurb:
      "Decide whether your app is made of solid panels or glass. One value covers the whole app, and it only takes effect where something can pass behind a surface.",
    spec: ["§10"],
    source: "foundations/materials.mdx",
    Content: Materials,
  },
  {
    slug: "foundations/depth",
    title: "Depth",
    section: "foundations",
    blurb:
      "No component picks its own shadow. You decide once whether your app has a light source, and every surface follows.",
    spec: ["§5", "§11"],
    source: "foundations/depth.mdx",
    Content: Depth,
  },
  {
    slug: "foundations/motion",
    title: "Motion",
    section: "foundations",
    blurb:
      "Motion runs on two clocks. A colour change lands on the very first frame, and anything that moves follows a spring.",
    spec: ["§8"],
    source: "foundations/motion.mdx",
    Content: Motion,
  },
  {
    slug: "foundations/states",
    title: "States and interaction",
    section: "foundations",
    blurb:
      "Every control shares one set of states: hover, press, focus, disabled and invalid. CSS handles all of them, so no JavaScript runs when someone points at a control.",
    spec: ["§8", "§9"],
    source: "foundations/states.mdx",
    Content: States,
  },
  {
    slug: "foundations/responsiveness",
    title: "Responsiveness",
    section: "foundations",
    blurb:
      "Adapt your interface to the person using it, not only to the width of the window. Touch and mouse need different targets, and that is a separate question from reflowing a layout.",
    spec: ["§2", "§17", "§18"],
    source: "foundations/responsiveness.mdx",
    Content: Responsiveness,
  },

  {
    slug: "patterns/composition",
    title: "Composition",
    section: "patterns",
    blurb:
      "Correct components do not add up to a good screen on their own. These are the rules for putting them together, and the builder checks most of them for you.",
    spec: ["§15", "§11"],
    source: "patterns/composition.mdx",
    Content: Composition,
  },
  {
    slug: "patterns/forms",
    title: "Forms",
    section: "patterns",
    blurb:
      "A form is a set of labelled values and one action that saves them. Every label belongs to its field, and no field should be louder than the one beside it.",
    spec: ["§11", "§15"],
    source: "patterns/forms.mdx",
    Content: Forms,
  },
  {
    slug: "patterns/modality",
    title: "Modality",
    section: "patterns",
    blurb:
      "Decide how much to interrupt someone. This page covers the difference between a surface that holds their work and one that stops them to ask a question.",
    spec: ["§24", "§25"],
    source: "patterns/modality.mdx",
    Content: Modality,
  },
  {
    slug: "patterns/navigation",
    title: "Navigation",
    section: "patterns",
    blurb:
      "The app frame is a pattern you build, not a component you drop in. This page shows which shape it should take at each window size.",
    spec: ["§26", "§27", "§18"],
    source: "patterns/navigation.mdx",
    Content: Navigation,
  },
  {
    slug: "patterns/feedback",
    title: "Feedback",
    section: "patterns",
    blurb:
      "An interface has four things to say about its own work: it is busy, it has made progress, it finished, or it failed. Each one has a single right answer.",
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
