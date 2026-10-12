/**
 * The Kookie UI launch film: one timeline over the stage's real shots (apps/docs/app/video/shots.tsx).
 * Every change is a function of the frame, so any frame renders the same every time.
 */
import * as React from "react";
import { AbsoluteFill, Easing, Sequence, continueRender, delayRender, interpolate, useCurrentFrame } from "remotion";
import { Theme } from "@kushagradhawan/kookie-ui-react";
import {
  CaptionIn,
  DeviceMorph,
  Floor,
  Glass,
  Ground,
  Hero,
  HeroBBody,
  HeroBody,
  Material,
  Nest,
  Open,
  Pill,
  Shape,
  SizeSnap,
  TouchType,
} from "../../docs/app/video/shots";

const ease = Easing.bezier(0.65, 0, 0.35, 1);
const out = Easing.bezier(0.16, 1, 0.3, 1);
const ramp = (f: number, a: number, b: number, e = ease) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });

/** Hold the frame until fonts and the glass lens have settled after a shot mounts. */
function Settle({ children }: { children: React.ReactNode }) {
  const [handle] = React.useState(() => delayRender("settle"));
  React.useEffect(() => {
    let live = true;
    (document.fonts?.ready ?? Promise.resolve())
      .then(() => new Promise((r) => setTimeout(r, 600)))
      .then(() => live && continueRender(handle));
    return () => {
      live = false;
      continueRender(handle);
    };
  }, [handle]);
  return <>{children}</>;
}

/** A shot with its caption arriving over its first frames. */
function Shot({ children, captionAt = 6 }: { children: React.ReactNode; captionAt?: number }) {
  const f = useCurrentFrame();
  return (
    <Settle>
      <CaptionIn.Provider value={ramp(f, captionAt, captionAt + 14, out)}>{children}</CaptionIn.Provider>
    </Settle>
  );
}

/* ── Shots ────────────────────────────────────────────────────────────────────────────── */

function Opening() {
  const f = useCurrentFrame();
  const tilt = 58 * (1 - ramp(f, 90, 280));
  return (
    <Shot captionAt={12}>
      <CaptionIn.Provider value={ramp(f, 12, 30, out) * (1 - ramp(f, 190, 220))}>
        <div style={{ opacity: ramp(f, 0, 24, out) }}>
          <Floor tilt={tilt} />
        </div>
      </CaptionIn.Provider>
    </Shot>
  );
}

function Screens() {
  const f = useCurrentFrame();
  const leave = ramp(f, 180, 215);
  return (
    <Shot>
      <Ground>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - leave, translate: `0 ${-48 * leave}px` }}>
          <HeroBody />
        </div>
        <HeroBBody t={ramp(f, 200, 270, out)} />
      </Ground>
    </Shot>
  );
}

function MaterialShot() {
  const f = useCurrentFrame();
  return (
    <Shot>
      <div style={{ opacity: ramp(f, 0, 10) }}>
        <Material />
      </div>
    </Shot>
  );
}

function GlassShot() {
  const f = useCurrentFrame();
  const p = ramp(f, 20, 150);
  return (
    <Shot>
      <Glass material="regular" x={3 + 9 * p} ticks={p >= 1} />
    </Shot>
  );
}

function Adapts() {
  const f = useCurrentFrame();
  const wipe = ramp(f, 30, 90);
  return (
    <Shot>
      <AbsoluteFill>
        <Hero />
      </AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `inset(0 ${100 - wipe * 100}% 0 0)` }}>
        <Hero dark />
      </AbsoluteFill>
    </Shot>
  );
}

function DeviceShot() {
  const f = useCurrentFrame();
  return (
    <Shot>
      <DeviceMorph p={ramp(f, 40, 190)} />
    </Shot>
  );
}

function Lineup() {
  const f = useCurrentFrame();
  return (
    <Shot>
      <SizeSnap t={ramp(f, 4, 60, out)} />
    </Shot>
  );
}

function Close() {
  const f = useCurrentFrame();
  return (
    <Shot>
      <Open t={ramp(f, 8, 40, out)} />
    </Shot>
  );
}

/* ── Timeline (frames at 30fps) ─────────────────────────────────────────────────────────── */

const PLAN: [number, React.ComponentType][] = [
  [300, Opening], // the screens lie on the floor, then stand up
  [450, Screens], // they settle; a second set rises in
  [300, MaterialShot],
  [300, GlassShot],
  [180, Adapts],
  [270, DeviceShot],
  [66, () => <Shot captionAt={2}><Pill /></Shot>],
  [66, () => <Shot captionAt={2}><Nest /></Shot>],
  [72, () => <Shot captionAt={2}><TouchType /></Shot>],
  [66, () => <Shot captionAt={2}><Shape /></Shot>],
  [150, Lineup],
  [120, Close],
];

export const LAUNCH_FRAMES = PLAN.reduce((n, [d]) => n + d, 0);

export function Launch() {
  let from = 0;
  return (
    <Theme appearance="light" material="regular" size="2">
      <AbsoluteFill style={{ background: "var(--neutral-4)" }}>
        {PLAN.map(([d, C], i) => {
          const at = from;
          from += d;
          return (
            <Sequence key={i} from={at} durationInFrames={d}>
              <C />
            </Sequence>
          );
        })}
      </AbsoluteFill>
    </Theme>
  );
}
