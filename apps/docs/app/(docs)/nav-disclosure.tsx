"use client";

/**
 * A COLLAPSIBLE NAV GROUP — and it is a docs-local block standing in for a component the
 * package will ship (Kushagra, 2026-08-21: "kookie will ship a tree too, not today, so if
 * docs need it, fine, do it in docs as adhoc block").
 *
 * WHEN THE TREE LANDS, DELETE THIS FILE. Nothing else should have to move: the call site in
 * `docs-nav.tsx` passes a label and children, which is the shape any tree node will take, so
 * the migration is a rename rather than a rewrite. That is the whole reason this is written
 * as one part with two props instead of being inlined into the nav.
 *
 * What it is NOT: a general tree. There is no arbitrary nesting, no roving focus across
 * levels, no expand-all, no persistence of which nodes are open, and no keyboard model beyond
 * what a `<button>` gives for free. A real tree owes `role="tree"`, `aria-expanded` on each
 * node, arrow-key traversal and typeahead — which is precisely why it is a component the
 * system designs rather than a thing the docs improvise. This handles exactly one level of
 * disclosure over a `ShellNavGroup`, because that is all the docs navigation needs, and
 * anything more would be inventing the API the package is going to own.
 *
 * The row is a real `ShellNavItem` (§21's row family) so a disclosure row and a navigation
 * row are the same object at the same height with the same states — the thing that would
 * drift instantly if this drew its own row.
 */
import * as React from "react";
import { Box, Flex, ShellNavGroup, ShellNavItem, Text } from "@kookie-ui/react";
import { iconGrid, iconStroke } from "@kookie-ui/react";

/** The one glyph this block draws. Not from the icon set: it must ROTATE with disclosure
    state, and the shared wrapper deliberately sets no size and takes no transform, so a
    rotation here would be the app fighting the control layer's icon box. Six lines of SVG
    that state their own box is the smaller lie. */
function Caret({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      style={{
        // No transition. Every animation in this system is designed (§8) and this block is a
        // placeholder — a motion the package has not specified is exactly the kind of thing
        // that outlives its placeholder.
        transform: open ? "rotate(90deg)" : "none",
        flex: "none",
      }}
    >
      <path
        d="M4.5 2.5L8 6l-3.5 3.5"
        stroke="currentColor"
        strokeWidth={(iconStroke * 12) / iconGrid}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function NavDisclosure({
  label,
  defaultOpen = false,
  children,
}: {
  label: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const id = React.useId();
  return (
    <ShellNavGroup>
      <ShellNavItem aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}>
        <Flex align="center" gap="2">
          <Caret open={open} />
          <Text size="2" weight="medium">
            {label}
          </Text>
        </Flex>
      </ShellNavItem>
      {/* Unmounted rather than hidden: a closed group's rows are not "there but invisible",
          and leaving them in the tree puts every component page in the tab order of every
          other page. */}
      {open ? (
        <Box id={id} pl="4">
          {children}
        </Box>
      ) : null}
    </ShellNavGroup>
  );
}
