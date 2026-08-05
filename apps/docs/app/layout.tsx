import "@kookie-ui/react/styles.css";
import "./globals.css";

import type { Metadata } from "next";
import Link from "next/link";
import { Box, Button, Flex, Heading, Theme } from "@kookie-ui/react";

import { appearanceScript } from "./appearance-script";
import { AppearanceToggle } from "./appearance-toggle";

export const metadata: Metadata = {
  title: "KookieUI",
  description:
    "Base UI primitives behind a Kookie-owned API, generated OKLCH color, token-only styling.",
};

/**
 * The root scope. `appearance="inherit"` is the whole dark-SSR design: the Theme stamps every
 * axis EXCEPT appearance, which lives on <html> where the pre-paint script put it — one
 * element owns the mode, no flash, and hydration matches because the server never guessed.
 * `suppressHydrationWarning` covers exactly the attributes that script writes before React
 * ever runs.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: appearanceScript }} />
      </head>
      <body>
        <Theme appearance="inherit">
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
              <Button size="1" emphasis="quiet" render={<Link href="/matrix" />}>
                Matrix
              </Button>
              <AppearanceToggle />
            </Flex>
            <Box p="5" render={<main />} style={{ flex: 1 }}>
              {children}
            </Box>
          </Flex>
        </Theme>
      </body>
    </html>
  );
}
