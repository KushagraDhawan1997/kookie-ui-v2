import Link from "next/link";
import { Box, Button, Flex, Heading } from "@kookie-ui/react";

import { AppearanceToggle } from "./appearance-toggle";

/**
 * The site's page shell — header, nav, and the page inset — as a component rather than as a
 * layout, because it has two callers that Next will never let share one.
 *
 * `(site)/layout.tsx` wraps the routes in the group. `not-found.tsx` cannot be in that group:
 * Next matches an unknown URL against no segment at all, so it wraps the root not-found in the
 * ROOT layout only. When the chrome moved into the route group (0d192d4) the 404 was left
 * behind and started rendering with no header, no inset and no `<main>` landmark — the heading
 * flush in the viewport's top-left corner with its ascenders clipped (audit 2026-08-08).
 *
 * Extracting the shell is the fix that keeps both properties: /preview still owns a bare
 * viewport (it renders under the root layout, outside this), and every page-shaped route —
 * including the one Next reaches on its own — gets the same chrome from one definition.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <Flex direction="column" style={{ minHeight: "100dvh" }}>
      <Flex align="center" justify="space-between" p="5" gap="4" render={<header />}>
        <Heading size="4" render={<span />}>
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
            KookieUI
          </Link>
        </Heading>
        {/* Flat on purpose — originally forced (a nested Flex group collapsed to zero
            width under the old blanket containment; opt-in since 2026-08-08, §2), kept
            because it works: the toggle is the grown item that absorbs the middle, so
            nav and chips sit at the edges without a wrapper. */}
        <Button size="1" emphasis="quiet" render={<Link href="/components" />}>
          Components
        </Button>
        <Button size="1" emphasis="quiet" render={<Link href="/preview" />}>
          Preview
        </Button>
        <Button size="1" emphasis="quiet" render={<Link href="/matrix" />}>
          Matrix
        </Button>
        <AppearanceToggle />
      </Flex>
      <Box p="5" render={<main />} style={{ flex: 1 }}>
        {children}
      </Box>
    </Flex>
  );
}
