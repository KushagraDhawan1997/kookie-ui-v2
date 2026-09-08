"use client";

/**
 * The sidebar's contents — plain nav groups since 2026-09-09 (Kushagra: "lets try sidebar").
 * It was a NavTree from 2026-08-26, which is a machine for DISCLOSURE, and this navigation has
 * none to do: three chapter sections, a component list and two instruments, all of it two
 * levels deep with nothing to open. Sections are headings again (`ShellNavGroup`, which is the
 * part that connects a heading to the rows under it) and every row is a `ShellNavItem` link.
 *
 * What is given up is the collapse: the component list is ~50 rows and they are all in the
 * scroller all the time. What is bought is that every destination is one press away and the
 * column has one kind of thing in it.
 *
 * A client component for exactly one reason — `usePathname`, because "you are here" is
 * information and the row announces it as `aria-current="page"` as well as painting it.
 *
 * DATA IS PASSED IN, not imported. The component registry's entries carry live React elements
 * for their examples, so importing it here would drag every documented component into the
 * client bundle to render a list of names. The layout reads both registries on the server and
 * hands this the two fields a link needs.
 */
import type * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, ShellNavGroup, ShellNavItem, ShellScroll } from "@kookie-ui/react";

import {
  AccordionIcon,
  AgentIcon,
  AllComponentsIcon,
  AvatarIcon,
  BadgeIcon,
  BlockquoteIcon,
  BlocksIcon,
  BoardIcon,
  BoxIcon,
  BreadcrumbIcon,
  BuildIcon,
  ButtonIcon,
  CardIcon,
  CheckboxIcon,
  ChipIcon,
  CodeBlockIcon,
  CodeIcon,
  ColorIcon,
  CommandIcon,
  CompassIcon,
  ComposerIcon,
  ContextMenuIcon,
  CursorIcon,
  DepthIcon,
  DeviceIcon,
  DialogIcon,
  FieldIcon,
  FileIcon,
  FlexIcon,
  FormIcon,
  GridIcon,
  HeadingIcon,
  IdeaIcon,
  InstallIcon,
  KbdIcon,
  LayoutIcon,
  LinkIcon,
  MaterialIcon,
  MegaphoneIcon,
  MenuIcon,
  MotionIcon,
  NavTreeIcon,
  NoticeIcon,
  PanelLeftIcon,
  PaperclipIcon,
  PopoverIcon,
  ProgressIcon,
  RadioGroupIcon,
  RadioIcon,
  RadiusIcon,
  RowIcon,
  ScrollAreaIcon,
  SegmentedControlIcon,
  SelectIcon,
  SeparatorIcon,
  SizeIcon,
  SliderIcon,
  SpinnerIcon,
  StackIcon,
  StructureIcon,
  SurfaceIcon,
  SwitchIcon,
  TableIcon,
  TabsIcon,
  TextAreaIcon,
  TextFieldIcon,
  TextIcon,
  ThemeIcon,
  ToggleIcon,
  ToolbarIcon,
  TooltipIcon,
  TreeIcon,
  TypeIcon,
  UsersIcon,
  VocabularyIcon,
  WarnIcon,
  WindowIcon,
} from "../icons";

/**
 * THE ROWS CARRY NO GLYPH. One word turns them back on and nothing else has to move.
 *
 * The table below is intact and every wrapper it names is still exported from `../icons`, so
 * this is a switch rather than a deletion — the alternative was ripping out the table and the
 * fifty-odd imports above it, which makes the way back a rewrite instead of an edit.
 *
 * What it costs while it is off: the table still references those wrappers, so the glyphs are
 * still in the client bundle. If that matters more than the easy way back, the change is to
 * delete this table and its import block; nothing else reads either.
 */
const ROW_ICONS = false;

/* ONE glyph per row, keyed by href because the section data crosses the server boundary as
   `{href, label}` (see the DATA IS PASSED IN note above) and a React component cannot ride in
   it without dragging the elements the other way. A row with no entry here renders bare — the
   lookup is optional by construction, so a new chapter or component fails nothing and simply
   shows up iconless until it is named here. */
const NAV_ICONS: Record<string, React.ComponentType> = {
  "/start/installation": InstallIcon,
  "/start/theming": ThemeIcon,
  "/start/quickstart": BuildIcon,
  "/start/agents": AgentIcon,
  "/start/principles": IdeaIcon,
  "/start/vocabulary": VocabularyIcon,
  "/foundations/color": ColorIcon,
  "/foundations/typography": TypeIcon,
  "/foundations/layout": LayoutIcon,
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

  "/builder": BoardIcon,
  "/blocks": BlocksIcon,

  "/components": AllComponentsIcon,
  "/components/accordion": AccordionIcon,
  "/components/alert-dialog": WarnIcon,
  "/components/attachment": PaperclipIcon,
  "/components/avatar": AvatarIcon,
  "/components/avatar-group": UsersIcon,
  "/components/badge": BadgeIcon,
  "/components/blockquote": BlockquoteIcon,
  "/components/box": BoxIcon,
  "/components/breadcrumb": BreadcrumbIcon,
  "/components/button": ButtonIcon,
  "/components/card": CardIcon,
  "/components/checkbox": CheckboxIcon,
  "/components/chip": ChipIcon,
  "/components/code": CodeIcon,
  "/components/code-block": CodeBlockIcon,
  "/components/command": CommandIcon,
  "/components/composer": ComposerIcon,
  "/components/context-menu": ContextMenuIcon,
  "/components/dialog": DialogIcon,
  "/components/field": FieldIcon,
  "/components/flex": FlexIcon,
  "/components/grid": GridIcon,
  "/components/heading": HeadingIcon,
  "/components/kbd": KbdIcon,
  "/components/link": LinkIcon,
  "/components/menu": MenuIcon,
  "/components/nav-tree": NavTreeIcon,
  "/components/notice": NoticeIcon,
  "/components/page": FileIcon,
  "/components/popover": PopoverIcon,
  "/components/progress": ProgressIcon,
  "/components/radio": RadioIcon,
  "/components/radio-group": RadioGroupIcon,
  "/components/row": RowIcon,
  "/components/scroll-area": ScrollAreaIcon,
  "/components/segmented-control": SegmentedControlIcon,
  "/components/select": SelectIcon,
  "/components/separator": SeparatorIcon,
  "/components/shell": PanelLeftIcon,
  "/components/slider": SliderIcon,
  "/components/spinner": SpinnerIcon,
  "/components/stack": StackIcon,
  "/components/surface": SurfaceIcon,
  "/components/switch": SwitchIcon,
  "/components/table": TableIcon,
  "/components/tabs": TabsIcon,
  "/components/text": TextIcon,
  "/components/text-area": TextAreaIcon,
  "/components/text-field": TextFieldIcon,
  "/components/theme": ThemeIcon,
  "/components/toggle": ToggleIcon,
  "/components/toolbar": ToolbarIcon,
  "/components/tooltip": TooltipIcon,
  "/components/tree": TreeIcon,
};

export type NavLink = { href: string; label: string };
export type NavSection = {
  id: string;
  title: string;
  links: readonly NavLink[];
};

/** One row. The href IS the identity, which is the whole current-page wiring. */
function NavRow({ href, label, current }: NavLink & { current: boolean }) {
  const Icon = ROW_ICONS ? NAV_ICONS[href] : undefined;
  return (
    <ShellNavItem
      current={current}
      render={<Link href={href} />}
      {...(Icon ? { leading: <Icon /> } : {})}
    >
      {label}
    </ShellNavItem>
  );
}

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
const WORKBENCH: NavLink[] = [
  { href: "/builder", label: "Builder" },
  // Blocks sits here for now rather than earning a section of its own: with one block the
  // index IS the section, and where the entry lives can be re-judged when there are several.
  { href: "/blocks", label: "Blocks" },
];

export function DocsNav({
  sections,
  components,
}: {
  sections: readonly NavSection[];
  components: readonly NavLink[];
}) {
  const pathname = usePathname();
  const row = (link: NavLink) => (
    <NavRow key={link.href} {...link} current={pathname === link.href} />
  );

  return (
    /* `fade` pairs with the pane's floating chrome (2026-08-30): the rows pass behind the
       wordmark row and the footer, and the fade is what keeps them legible while they do. */
    <ShellScroll fade>
      {/* The pane's chrome FLOATS over this scroller, so the nav spends the published reach
          (§27, the safe-area pattern at pane scale): the rows REST clear of the chrome and
          scroll behind it. Minus the viewport's own re-pad, because the scroller already
          insets by the pane's padding. */}
      <Box
        style={{
          paddingBlockStart:
            "calc(var(--kui-pane-inset-block-start) - var(--kui-sf-p))",
          paddingBlockEnd:
            "calc(var(--kui-pane-inset-block-end) - var(--kui-sf-p))",
        }}
      >
        {sections.map((section) => (
          <ShellNavGroup key={section.id} label={section.title}>
            {section.links.map(row)}
          </ShellNavGroup>
        ))}
        <ShellNavGroup label="Components">
          {row({ href: "/components", label: "All components" })}
          {components.map(row)}
        </ShellNavGroup>
        <ShellNavGroup label="Workbench">
          {WORKBENCH.map(row)}
        </ShellNavGroup>
      </Box>
    </ShellScroll>
  );
}
