import Link from "next/link";
import { Button, Flex, Stack } from "@kookie-ui/react";

import { PageFrame, PageTitle } from "./page-frame";

/**
 * What a 404 SAYS, with no chrome around it — because it is rendered under two different
 * boundaries and only one of them has to supply the frame.
 *
 * Next resolves a missing page two ways, and the docs hit both. A URL that matches nothing at
 * all is wrapped in the ROOT layout only, so `app/not-found.tsx` has to draw the chrome itself
 * (2026-08-08 — a route group is a layout boundary, not a place). A URL that MATCHES
 * `[...slug]` and then calls `notFound()` is a different case: every layout above the boundary
 * is kept, so `(docs)/layout.tsx` has already drawn the chrome by the time the not-found
 * renders. Drawing it again there put a whole second shell inside the first — two sidebars,
 * two wordmarks, and the pane trigger sitting on top of the heading (reported 2026-09-01,
 * found by following a link into `/foundations`, which is a real match with no chapter).
 *
 * So the body lives here and each boundary states its own frame: the root one wraps this in
 * `DocsChrome`, the one beside `layout.tsx` does not.
 */
export function NotFoundBody() {
  return (
    /* THE PAGE FRAME, not a hand-written max-width (2026-09-01). It was a bare Stack, so it
       began at the top of the reading column — and the pane's trigger is FLOATING chrome that
       deliberately overlays that column, so the toggle sat on top of the "404" itself. Every
       other page clears it by way of the frame's air above the title, which is the whole
       reason that air has one home. The 34rem measure moves here with it. */
    <PageFrame width="34rem">
      <Stack gap="6">
        {/* `PageTitle`, not a hand-written h1 and deck — the interval between a title and the
            sentence under it has one home, and a 404 is a page like any other. Moving this
            file into the group is what put it under that law, and the law was right. */}
        <PageTitle
          deck="That page does not exist. It may have been renamed while the system was being built — most things here still are."
        >
          404
        </PageTitle>
        <Flex gap="3">
        <Button size="2" tone="accent" emphasis="loud" render={<Link href="/" />}>
          Back to the start
        </Button>
        <Button size="2" emphasis="quiet" bordered render={<Link href="/matrix" />}>
          The judging matrix
        </Button>
        </Flex>
      </Stack>
    </PageFrame>
  );
}
