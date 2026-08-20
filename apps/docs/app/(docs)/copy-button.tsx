"use client";

/**
 * Copy-to-clipboard for a code sample. The one interactive part of a code block, and the
 * only reason any of this is a client component — everything else about a fence is decided
 * at build time.
 *
 * The confirmation is the BUTTON's own label changing, not a toast: a toast is a floating
 * layer announcing something the thing you just pressed can say itself, and this system has
 * no toast anyway (§11 lists one; it has never shipped). The label reverts on a timer, which
 * is state, not motion — nothing here reads a motion token.
 */
import * as React from "react";
import { Button } from "@kookie-ui/react";

import { CheckIcon, CopyIcon } from "../icons";

export function CopyButton({ code, label = "Copy" }: { code: string; label?: string }) {
  const [copied, setCopied] = React.useState(false);
  // Held in a ref so a second press restarts one timer rather than racing two, and so the
  // pending one is cleared on unmount — a page can navigate away mid-timeout.
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <Button
      size="1"
      emphasis="quiet"
      leading={copied ? <CheckIcon /> : <CopyIcon />}
      onClick={() => {
        // `?.` because clipboard access is absent on insecure origins — a docs site served
        // over plain HTTP on a LAN is the ordinary case, and there the press should do
        // nothing rather than throw an unhandled rejection into the console.
        void navigator.clipboard?.writeText(code).then(() => {
          setCopied(true);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => setCopied(false), 2000);
        });
      }}
    >
      {copied ? "Copied" : label}
    </Button>
  );
}
