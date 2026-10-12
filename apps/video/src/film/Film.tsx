/** The whole film: the acts in order, each mounted for its own span. */
import * as React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Theme } from "@kushagradhawan/kookie-ui-react";
import { Settle } from "../Launch";
import { Act1, ACT1_FRAMES } from "./Act1";
import { CLOSE_FRAMES, CloseAct, DETAILS_FRAMES, DetailsAct, DEVICE_FRAMES, DeviceAct, GLASS_FRAMES, GlassAct, LINEUP_FRAMES, LineupAct } from "./Acts";

const ACTS: [number, React.ComponentType][] = [
  [ACT1_FRAMES, Act1],
  [GLASS_FRAMES, GlassAct],
  [DEVICE_FRAMES, DeviceAct],
  [DETAILS_FRAMES, DetailsAct],
  [LINEUP_FRAMES, LineupAct],
  [CLOSE_FRAMES, CloseAct],
];

export const FILM_FRAMES = ACTS.reduce((n, [d]) => n + d, 0);

export function Film() {
  let from = 0;
  return (
    <Theme appearance="light" material="regular" size="2">
      <AbsoluteFill style={{ background: "var(--neutral-4)" }}>
        {ACTS.map(([d, C], i) => {
          const at = from;
          from += d;
          return (
            <Sequence key={i} from={at} durationInFrames={d}>
              <Settle>
                <C />
              </Settle>
            </Sequence>
          );
        })}
      </AbsoluteFill>
    </Theme>
  );
}
