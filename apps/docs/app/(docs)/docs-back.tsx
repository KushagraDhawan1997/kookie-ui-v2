"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "@kookie-ui/react";

import { ArrowLeftIcon } from "../icons";

/**
 * The way back out of a component's page, in the pane's floating chrome (2026-09-01,
 * Kushagra: "make this ad-hoc back button to components be a backdrop, floating next to
 * sidebar toggle").
 *
 * IT WAS INLINE, ABOVE THE TITLE — a `← Components` link inside the page's own frame, which
 * put a navigation control in the reading column and made every component page start with a
 * line that is not about the component. Going back is chrome: it belongs beside the control
 * that opens the nav, in the same floating band, wearing the same treatment (quiet, icon-only,
 * `backdrop` — §10's selectivity, stated because this floats over the reading column).
 *
 * A CLIENT COMPONENT FOR ONE REASON, which is `docs-nav.tsx`'s reason: the chrome is rendered
 * once for every route, so the only thing that can tell it whether this route HAS a way back
 * is the pathname. It draws nothing anywhere else, `/components` itself included — a back
 * button on the page you would go back to is a dead control.
 *
 * The word is not lost with the label: an icon-only control in a cluster reads as one thing,
 * and the Tooltip says where it goes. The `aria-label` says it for everyone else.
 */
export function DocsBack() {
  const pathname = usePathname();
  // A component's own page, never the index — `/components/button`, not `/components`.
  const onComponentPage = /^\/components\/[^/]+$/.test(pathname ?? "");
  if (!onComponentPage) return null;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            emphasis="quiet"
            iconOnly
            backdrop
            aria-label="Back to components"
            render={<Link href="/components" />}
          >
            <ArrowLeftIcon />
          </Button>
        }
      />
      <TooltipContent>Components</TooltipContent>
    </Tooltip>
  );
}
