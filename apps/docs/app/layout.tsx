import "@kookie-ui/react/styles.css";
import "./globals.css";

import type { Metadata } from "next";
import { Theme } from "@kookie-ui/react";

import { appearanceScript } from "./appearance-script";

export const metadata: Metadata = {
  title: "KookieUI",
  description:
    "Base UI primitives behind a Kookie-owned API, generated OKLCH color, token-only styling.",
};

/**
 * The root scope, and ONLY the scope. `appearance="inherit"` is the whole dark-SSR design:
 * the Theme stamps every axis EXCEPT appearance, which lives on <html> where the pre-paint
 * script put it — one element owns the mode, no flash, and hydration matches because the
 * server never guessed. `suppressHydrationWarning` covers exactly the attributes that script
 * writes before React ever runs.
 *
 * The site chrome (header, nav, page padding) lives in the (site) route group; /preview owns
 * its own full-viewport shell. The root stays chrome-free so a route can be an app rather
 * than a page.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: appearanceScript }} />
      </head>
      <body>
        <Theme appearance="inherit">{children}</Theme>
      </body>
    </html>
  );
}
