import type { Metadata } from "next";
import { Chip, Code, Page } from "@kushagradhawan/kookie-ui-react";
import type * as React from "react";

import { ProseFlow } from "../../../mdx-components";
import { PageFrame } from "../page-frame";
import Content from "./whats-new.mdx";

/** The three tiers each item starts with, written as inline code so the root file reads
    the same on GitHub. Here they are a Chip; any other code span stays `<Code>`. */
const TIERS = new Set(["Major", "Minor", "Quiet"]);

function code({ children }: { children?: React.ReactNode }) {
  return typeof children === "string" && TIERS.has(children) ? (
    <Chip size="1">{children}</Chip>
  ) : (
    <Code>{children}</Code>
  );
}

/**
 * The release notes, rendered from `WHATS_NEW.md` at the repo root.
 *
 * A ROUTE OF ITS OWN, NOT A CHAPTER. `chapters.ts` drives the sidebar, the pager and the
 * markdown twins, and a changelog is none of those — it is a page a reader reaches from the
 * footer. So it sits beside the registry rather than in it, and its `.mdx` lives here rather
 * than under `content/`, where the registry law would ask for a row.
 *
 * `whats-new.mdx` is the root file without its `#` line, which `Page` renders as the title.
 * Keep the two in step until `next.config.ts` loads `.md` directly.
 *
 * The chapter renderer's column and flow, minus the table of contents: the headings are
 * months, and a list of months beside a list of months says nothing.
 */
export const metadata: Metadata = {
  title: "What's new — KookieUI",
  alternates: { canonical: "/whats-new" },
};

export default function WhatsNewPage() {
  return (
    <PageFrame width="var(--kd-measure)">
      <Page title="What's new in Kookie UI" style={{ minWidth: 0 }}>
        <ProseFlow>
          <Content components={{ code }} />
        </ProseFlow>
      </Page>
    </PageFrame>
  );
}
