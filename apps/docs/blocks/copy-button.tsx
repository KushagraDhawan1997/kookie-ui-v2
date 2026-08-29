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
import { Button, type Size } from "@kookie-ui/react";

import { CheckIcon, CopyIcon } from "../app/icons";

export function CopyButton({
  code,
  label = "Copy",
  size = "1",
  icon,
}: {
  code: string;
  label?: string;
  /** The block's index, passed through — the chrome rides the same ladder as the pane. */
  size?: Size;
  /**
   * The resting glyph, for a button whose label already says what it copies. The code button
   * leaves it unset and gets a copy mark, because "Copy" is a verb with no object and the
   * glyph is what names the object. The NAME button passes a file mark instead (2026-08-28,
   * Kushagra): its label is the object, so a copy mark there would say the same thing twice
   * and two identical marks at either end of one pane would read as two of the same control.
   *
   * The CONFIRMATION is not overridable. Whatever the resting glyph, a press shows the check
   * — that is the button reporting what happened, and a component that let a call site
   * silence it would let a call site ship a copy that never says it copied.
   */
  icon?: React.ReactNode;
}) {
  const [copied, setCopied] = React.useState(false);
  // Held in a ref so a second press restarts one timer rather than racing two, and so the
  // pending one is cleared on unmount — a page can navigate away mid-timeout.
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);

  return (
    // Medium is Button's own default, so no emphasis is stated; `backdrop` because this
    // button FLOATS over the code — a floating control takes the theme's material (glass).
    <Button
      size={size}
      backdrop
      leading={copied ? <CheckIcon /> : (icon ?? <CopyIcon />)}
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
