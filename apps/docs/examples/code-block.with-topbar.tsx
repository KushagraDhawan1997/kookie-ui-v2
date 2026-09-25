"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon } from "@hugeicons/core-free-icons";
import { Code, CodeBlock, Toolbar, ToolbarButton, iconStroke } from "@kushagradhawan/kookie-ui-react";

const SOURCE = `export async function archiveProject(id: string) {
  const project = await db.projects.find(id);
  if (!project) throw new Error("Project not found");
  return db.projects.update(id, { archivedAt: new Date() });
}`;

// The name sits at one wall and the copy button at the other, so the row
// spans the pane. `band` tells the well to start the code below it.
export default function Example() {
  const [copied, setCopied] = React.useState(false);

  return (
    <CodeBlock
      band
      topbar={
        <Toolbar>
          <Code>archive.ts</Code>
          <ToolbarButton
            iconOnly
            done={copied}
            aria-label={copied ? "Copied" : "Copy code"}
            onClick={() => {
              void navigator.clipboard.writeText(SOURCE);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            }}
          >
            <HugeiconsIcon icon={Copy01Icon} strokeWidth={iconStroke} aria-hidden />
          </ToolbarButton>
        </Toolbar>
      }
    >
      {SOURCE}
    </CodeBlock>
  );
}
