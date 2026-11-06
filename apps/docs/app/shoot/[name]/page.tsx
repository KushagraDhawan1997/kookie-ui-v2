"use client";

/**
 * THE FIGURES' SHOOTING PAGES (2026-11-06, Kushagra: "why aren't these images?", then "Go", then
 * "Lets make all images?"). Each figure live, alone on a page, so `pnpm figures` can open what a
 * figure shows open and photograph it in light and dark. `editor` is the hero's window at its
 * real size; every other name is a docs figure (principle-figures.tsx) in its band, at the 704px
 * a figure has beside the contents column. Never shipped: 404 in a production build.
 */
import * as React from "react";
import { notFound, useParams, useSearchParams } from "next/navigation";
import { Theme } from "@kushagradhawan/kookie-ui-react";

import { BrowserBar } from "../../(docs)/browser-chrome";
import { EditorApp } from "../../(docs)/editor-app";
import { ShootingContext } from "../../(docs)/figure-shot";
import * as Figures from "../../(docs)/principle-figures";

type Scheme = "light" | "dark";

/** The windows shot on their own, exactly as their figure drew them live. */
const WINDOWS: Record<string, () => React.ReactNode> = {
  editor: () => (
    <Theme size="3" material="3" className="kd-hero-window kd-edit-window">
      <BrowserBar url="kookie.studio/edit" />
      <EditorApp timelineEnd />
    </Theme>
  ),
};

export default function Shoot() {
  const { name } = useParams<{ name: string }>();
  // The appearance is stated, not read from the page: `?theme=dark` (the script passes it).
  const appearance: Scheme = useSearchParams().get("theme") === "dark" ? "dark" : "light";
  const window = WINDOWS[name];
  const Figure = name in Figures.PRINCIPLE_FIGURES ? (Figures as unknown as Record<string, React.ComponentType>)[name] : undefined;
  if (process.env.NODE_ENV === "production" || (!window && !Figure)) notFound();
  return (
    <ShootingContext value>
      <Theme appearance={appearance} className="kd-shoot">
        {window ? window() : <div className="kd-figure kd-shoot-figure">{Figure && <Figure />}</div>}
      </Theme>
    </ShootingContext>
  );
}
