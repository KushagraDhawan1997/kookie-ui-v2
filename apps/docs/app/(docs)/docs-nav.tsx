"use client";

/**
 * The sidebar's contents — ONE NavTree since 2026-08-26 (Kushagra: "swap docs shell sidebar's
 * internals with tree"). Sections are collapsible level-0 nodes, chapters and the component
 * pages are their children, and the whole structure is data handed to the machine §33 ships:
 * disclosure state, the announcement (buttons with aria-expanded, links with aria-current) and
 * the derived indent are the package's, so this file is back to being a data table.
 *
 * A client component for exactly one reason — `usePathname`, because "you are here" is
 * information and the tree announces it as `aria-current="page"` as well as painting it.
 *
 * DATA IS PASSED IN, not imported. The component registry's entries carry live React elements
 * for their examples, so importing it here would drag every documented component into the
 * client bundle to render a list of names. The layout reads both registries on the server and
 * hands this the two fields a link needs.
 */
import type * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, NavTree, ShellScroll, type TreeNode } from "@kookie-ui/react";

import {
  BlocksIcon,
  BoardIcon,
  ColorIcon,
  CompassIcon,
  CursorIcon,
  DepthIcon,
  DeviceIcon,
  FamiliesIcon,
  FormIcon,
  IdeaIcon,
  InstallIcon,
  LayoutIcon,
  MaterialIcon,
  MegaphoneIcon,
  MotionIcon,
  RadiusIcon,
  RocketIcon,
  RulesIcon,
  SizeIcon,
  StructureIcon,
  ThemeIcon,
  TypeIcon,
  WindowIcon,
} from "../icons";

/* One glyph per chapter, keyed by href because the section data crosses the server boundary
   as `{href, label}` (see the DATA IS PASSED IN note above) and a React component cannot ride
   in it without dragging the elements the other way. A chapter with no entry here renders
   bare — the lookup is optional by construction, so a new chapter fails nothing and simply
   shows up iconless until it is named here. The component rows stay bare on purpose: a list
   of like things, where a glyph per row is an invented metaphor thirty-one times. */
const CHAPTER_ICONS: Record<string, React.ComponentType> = {
  "/start/installation": InstallIcon,
  "/start/theming": ThemeIcon,
  "/start/your-first-screen": RocketIcon,
  "/philosophy/why-kookie-exists": IdeaIcon,
  "/philosophy/component-families": FamiliesIcon,
  "/philosophy/why-these-rules-hold": RulesIcon,
  "/foundations/color": ColorIcon,
  "/foundations/typography": TypeIcon,
  "/foundations/space-and-layout": LayoutIcon,
  "/foundations/size": SizeIcon,
  "/foundations/radius": RadiusIcon,
  "/foundations/materials": MaterialIcon,
  "/foundations/depth": DepthIcon,
  "/foundations/motion": MotionIcon,
  "/foundations/states": CursorIcon,
  "/foundations/responsiveness": DeviceIcon,
  "/patterns/composition": StructureIcon,
  "/patterns/forms": FormIcon,
  "/patterns/modality": WindowIcon,
  "/patterns/navigation": CompassIcon,
  "/patterns/feedback": MegaphoneIcon,
};

export type NavLink = { href: string; label: string };
export type NavSection = { id: string; title: string; links: readonly NavLink[] };

/** A chapter or component page as a tree leaf: the href IS the id, which is also what makes
    `currentId={pathname}` the whole current-page wiring. */
const leaf = ({ href, label }: NavLink): TreeNode => {
  const Icon = CHAPTER_ICONS[href];
  return { id: href, label, href, ...(Icon ? { leading: <Icon /> } : {}) };
};

/**
 * The instruments, in the navigation rather than only in the header.
 *
 * The BUILDER is public on purpose (LOG 2026-08-21): a system whose claim is "the guidelines
 * are enforced" owes a reader somewhere to go and watch that happen, and the builder's live
 * review is the shortest demonstration there is.
 *
 * `/preview` AND `/matrix` ARE NOT LINKED FROM HERE any more (Kushagra, 2026-08-29). Both
 * routes still exist and both are still built and law-checked — the playground law walks the
 * package's exports against what `/preview` renders, and neither is going anywhere. They are
 * simply not for a reader: one is the judging surface for a visual change and the other is a
 * cell inspector for one exact axis combination, and a docs navigation that lists them is
 * offering a stranger two rooms with nothing in them for a stranger. Someone who wants them
 * types the path.
 *
 * A plain array rather than a prop, because unlike the chapters and the components these are
 * not derived from anything — there are two of them and they are named here.
 */
const WORKBENCH: (NavLink & { icon: React.ComponentType })[] = [
  { href: "/builder", label: "Builder", icon: BoardIcon },
  // Blocks sits here for now rather than earning a section of its own: with one block the
  // index IS the section, and where the entry lives can be re-judged when there are several.
  { href: "/blocks", label: "Blocks", icon: BlocksIcon },
];

export function DocsNav({
  sections,
  components,
}: {
  sections: readonly NavSection[];
  components: readonly NavLink[];
}) {
  const pathname = usePathname();
  // A component page is `/components/<slug>`, so the group holding it opens on arrival —
  // landing on a page whose place in the navigation is collapsed is the disclosure pattern's
  // one real failure mode.
  const inComponents = pathname?.startsWith("/components") ?? false;

  const items: TreeNode[] = [
    ...sections.map(
      (section): TreeNode => ({
        id: section.id,
        label: section.title,
        children: section.links.map(leaf),
      }),
    ),
    {
      id: "components",
      label: "Components",
      children: [
        leaf({ href: "/components", label: "All components" }),
        ...components.map(leaf),
      ],
    },
    {
      id: "workbench",
      label: "Workbench",
      children: WORKBENCH.map(({ href, label, icon: Icon }) => ({
        id: href,
        label,
        href,
        leading: <Icon />,
      })),
    },
  ];

  return (
    /* `fade` pairs with the pane's floating chrome (2026-08-30): the rows pass behind the
       wordmark row and the footer, and the fade is what keeps them legible while they do. */
    <ShellScroll fade>
      {/* The pane's chrome FLOATS over this scroller, so the tree spends the published reach
          (§27, the safe-area pattern at pane scale): the rows REST clear of the chrome and
          scroll behind it. Minus the viewport's own re-pad, because the scroller already
          insets by the pane's padding. */}
      <Box
        style={{
          paddingBlockStart: "calc(var(--kui-pane-inset-block-start) - var(--kui-sf-p))",
          paddingBlockEnd: "calc(var(--kui-pane-inset-block-end) - var(--kui-sf-p))",
        }}
      >
      <NavTree
        items={items}
        // Every section open on arrival; Components only when you are standing in it. The
        // tree is uncontrolled past this, so a reader's open/closed choices stick while the
        // page lives.
        defaultExpandedIds={[
          ...sections.map((s) => s.id),
          "workbench",
          ...(inComponents ? ["components"] : []),
        ]}
        currentId={pathname ?? null}
        renderLink={(node) => <Link href={node.href!} />}
      />
      </Box>
    </ShellScroll>
  );
}
