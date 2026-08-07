import Link from "next/link";
import { Box, Button, Flex, Heading } from "@kookie-ui/react";

import { AppearanceToggle } from "../appearance-toggle";

/** The site chrome, moved out of the root so /preview can own a full-viewport shell. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex direction="column" style={{ minHeight: "100dvh" }}>
      <Flex align="center" justify="space-between" p="5" gap="4" render={<header />}>
        <Heading size="4" render={<span />}>
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
            KookieUI
          </Link>
        </Heading>
        {/* Flat on purpose: a nested Flex group would be a Box as a row-flex item,
            which inline-size containment collapses to zero width (see the note in
            appearance-toggle.tsx). The toggle is the grown item that absorbs the
            middle, so nav and chips sit at the edges without a wrapper. */}
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
