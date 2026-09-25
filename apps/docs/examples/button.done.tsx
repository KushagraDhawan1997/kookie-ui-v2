"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon } from "@hugeicons/core-free-icons";
import { Button, Flex, iconStroke } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = () => {
    void navigator.clipboard?.writeText("sk_live_4471");
    setCopied(true);
  };

  return (
    <Flex gap="3" align="center">
      <Button done={copied} onClick={copy} leading={<HugeiconsIcon icon={Copy01Icon} strokeWidth={iconStroke} aria-hidden />}>
        {copied ? "Copied" : "Copy API key"}
      </Button>
      <Button iconOnly emphasis="quiet" done={copied} onClick={copy} aria-label={copied ? "Copied" : "Copy API key"}>
        <HugeiconsIcon icon={Copy01Icon} strokeWidth={iconStroke} aria-hidden />
      </Button>
    </Flex>
  );
}
