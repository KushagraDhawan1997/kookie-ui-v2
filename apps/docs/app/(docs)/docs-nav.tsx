"use client";

/**
 * The sidebar's contents. A client component for exactly one reason — `usePathname`, because
 * "you are here" is information and `ShellNavItem`'s `current` announces it as well as
 * painting it.
 *
 * DATA IS PASSED IN, not imported. The component registry's entries carry live React elements
 * for their examples, so importing it here would drag every documented component into the
 * client bundle to render a list of names. The layout reads both registries on the server and
 * hands this the two fields a link needs.
 */
import type * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShellNavGroup, ShellNavItem, ShellScroll, Stack } from "@kookie-ui/react";

import { NavDisclosure } from "./nav-disclosure";
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
  MatrixIcon,
  MaterialIcon,
  MegaphoneIcon,
  MotionIcon,
  PreviewIcon,
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

function Row({
  href,
  label,
  current,
  icon: Icon,
}: NavLink & { current: boolean; icon?: React.ComponentType | undefined }) {
  return (
    <ShellNavItem
      current={current}
      {...(Icon ? { leading: <Icon /> } : {})}
      render={<Link href={href} />}
    >
      {label}
    </ShellNavItem>
  );
}

/**
 * The instruments, in the navigation rather than only in the header.
 *
 * They are public on purpose (LOG 2026-08-21): a system whose claim is "the guidelines are
 * enforced" owes a reader somewhere to go and watch that happen, and the builder's live review
 * is the shortest demonstration there is. A header link reads as an afterthought; a nav group
 * says they are part of the documentation.
 *
 * A plain array rather than a prop, because unlike the chapters and the components these are
 * not derived from anything — there are three of them and they are named here.
 */
const WORKBENCH: (NavLink & { icon: React.ComponentType })[] = [
  { href: "/builder", label: "Builder", icon: BoardIcon },
  { href: "/preview", label: "Preview", icon: PreviewIcon },
  { href: "/matrix", label: "Matrix", icon: MatrixIcon },
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

  return (
    <ShellScroll>
      {/* 24px between groups against 0 between the rows inside one — the proximity rule's two
          distances, and they were 12 and 0 before 2026-08-25, which is one layout-space step
          apart where §15 asks for two. The label's own weight step (shell.css) is the other
          half of the same repair: distance says where a group ends, treatment says that the
          line at the top of it is a heading rather than another link. */}
      <Stack gap="6">
        {sections.map((section) => (
          <ShellNavGroup key={section.id} label={section.title}>
            {section.links.map((link) => (
              <Row
                key={link.href}
                {...link}
                icon={CHAPTER_ICONS[link.href]}
                current={pathname === link.href}
              />
            ))}
          </ShellNavGroup>
        ))}
        <NavDisclosure label="Components" defaultOpen={inComponents}>
          <Stack gap="1">
            <Row href="/components" label="All components" current={pathname === "/components"} />
            {components.map((link) => (
              <Row key={link.href} {...link} current={pathname === link.href} />
            ))}
          </Stack>
        </NavDisclosure>
        <ShellNavGroup label="Workbench">
          {WORKBENCH.map((link) => (
            // Never `current`: these routes render outside this navigation entirely — each
            // owns its own viewport — so a row here can only ever be a way out, and painting
            // one as the page you are on would be a lie the moment you arrived.
            <Row key={link.href} {...link} current={false} />
          ))}
        </ShellNavGroup>
      </Stack>
    </ShellScroll>
  );
}
