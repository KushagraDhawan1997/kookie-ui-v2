"use client";

/** The saved export version (2026-11-06): flush panes, filmstrip, photo shown whole. Scratch only. */
import { notFound, useSearchParams } from "next/navigation";
import { Theme } from "@kushagradhawan/kookie-ui-react";

import { ExportAppWithStrip } from "../../(docs)/principle-figures";

export default function ScratchExportSaved() {
  if (process.env.NODE_ENV === "production") notFound();
  const params = useSearchParams();
  const appearance = params.get("theme") === "dark" ? "dark" : "light";
  const photo = params.get("photo") ?? undefined;
  return (
    <Theme appearance={appearance} size="2" material="3" className="kd-scratch-export kd-export-window">
      <ExportAppWithStrip {...(photo ? { photo } : {})} />
    </Theme>
  );
}
