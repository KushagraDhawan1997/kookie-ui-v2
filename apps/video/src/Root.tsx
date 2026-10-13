import * as React from "react";
import { Composition } from "remotion";
import { Theme } from "@kushagradhawan/kookie-ui-react";
import { Launch, LAUNCH_FRAMES, Settle } from "./Launch";
import { Act1, ACT1_FRAMES } from "./film/Act1";
import { Film, FILM_FRAMES } from "./film/Film";
import { Sample, SAMPLE_FRAMES } from "./film/Sample";
import { Physics, PHYSICS_FRAMES } from "./film/Physics";
import "./global.css";

function Act1Film() {
  return (
    <Theme appearance="light" material="regular" size="2">
      <Settle>
        <Act1 />
      </Settle>
    </Theme>
  );
}

function PhysicsFilm() {
  return (
    <Theme appearance="light" material="regular" size="2">
      <Settle>
        <Physics />
      </Settle>
    </Theme>
  );
}

function SampleFilm() {
  return (
    <Theme appearance="light" material="regular" size="2">
      <Settle>
        <Sample />
      </Settle>
    </Theme>
  );
}

/** CSS frame 1440×810, rendered at scale 4/3 to 1920×1080 (glass must never be zoomed). */
export function Root() {
  return (
    <>
      <Composition id="Launch" component={Launch} durationInFrames={LAUNCH_FRAMES} fps={30} width={1440} height={810} />
      <Composition id="Film" component={Film} durationInFrames={FILM_FRAMES} fps={30} width={1440} height={810} />
      <Composition id="Physics" component={PhysicsFilm} durationInFrames={PHYSICS_FRAMES} fps={30} width={1440} height={810} />
      <Composition id="Sample" component={SampleFilm} durationInFrames={SAMPLE_FRAMES} fps={30} width={1440} height={810} />
      <Composition id="Act1" component={Act1Film} durationInFrames={ACT1_FRAMES} fps={30} width={1440} height={810} />
    </>
  );
}
