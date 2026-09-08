/**
 * The block usage registry — one entry per block, keyed by slug.
 *
 * Separate from `examples/index.ts` on purpose, and the reason is mechanical rather than
 * tidy: several laws render every entry of that map synchronously, and two blocks are async
 * server components (a sample tokenizes before it can be drawn). Putting them in the same map
 * would make those laws fail on a correct file.
 *
 * The design is the component examples' whole design, reused: the file is imported and
 * rendered, and the same file is read off disk and shown, so a usage snippet cannot disagree
 * with the picture above it and `tsc` checks every line the site publishes.
 */
import type * as React from "react";

import CodeSampleUsage from "./code-sample";
import EmptyStateUsage from "./empty-state";
import FooterUsage from "./footer";
import SpecimenUsage from "./specimen";
import TableOfContentsUsage from "./table-of-contents";

export const BLOCK_EXAMPLES: Record<
  string,
  () => React.ReactElement | Promise<React.ReactElement>
> = {
  "code-sample": CodeSampleUsage,
  "empty-state": EmptyStateUsage,
  footer: FooterUsage,
  specimen: SpecimenUsage,
  "table-of-contents": TableOfContentsUsage,
};
