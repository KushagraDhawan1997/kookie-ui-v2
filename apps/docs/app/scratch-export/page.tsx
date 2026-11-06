"use client";

/**
 * A SCRATCH surface, never shipped (2026-11-05, Kushagra: "why arent we iterating in a separate
 * screen"). The Serve the job export app on its own, filling the window at a 14-inch screen's size,
 * so it can be judged as a real app before it goes back into the principles figure.
 * `?theme=dark` shows it dark; `?photo=city-hall` (facades, white-street, cathedral, old-town) swaps
 * the picture. When the figure settles, this route dies.
 */
import { notFound, useSearchParams } from "next/navigation";
import { Theme } from "@kushagradhawan/kookie-ui-react";

import { ExportApp } from "../(docs)/principle-figures";

export default function ScratchExport() {
  if (process.env.NODE_ENV === "production") notFound();
  const params = useSearchParams();
  const appearance = params.get("theme") === "dark" ? "dark" : "light";
  const photo = params.get("photo") ?? undefined;
  return (
    <Theme appearance={appearance} size="2" material="3" className="kd-scratch-export kd-export-window">
      <ExportApp {...(photo ? { photo } : {})} />
    </Theme>
  );
}
