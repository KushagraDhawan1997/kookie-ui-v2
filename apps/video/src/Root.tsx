import * as React from "react";
import { Composition } from "remotion";
import { Launch, LAUNCH_FRAMES } from "./Launch";
import "./global.css";

/** CSS frame 1440×810, rendered at scale 4/3 to 1920×1080 (glass must never be zoomed). */
export function Root() {
  return <Composition id="Launch" component={Launch} durationInFrames={LAUNCH_FRAMES} fps={30} width={1440} height={810} />;
}
