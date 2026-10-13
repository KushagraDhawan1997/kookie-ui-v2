/**
 * The launch film, story v5 (/mnt/project-files/kookie-video/kookie-ui-story-v5.md). Cut to a
 * 120 BPM grid: one beat is 15 frames, every section starts on a beat, every hard event lands on one.
 *
 *   intent → made of parts → touch → glass and dark → corners → size → burst → logo
 */
import * as React from "react";
import { Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Button, Card, Flex, Heading, Stack, Text, TextField, Theme } from "@kushagradhawan/kookie-ui-react";
import { Nest, Open } from "../../../docs/app/video/shots";
import { GlassAct, G } from "./Acts";
import { Parts, PARTS_FRAMES } from "./Parts";
import { Physics } from "./Physics";
import { Burst, Open1, S, Statement } from "./Sample";
import { World, W, H, gx, lerp, out, ramp, track } from "./kit";

export const F = {
  intent: 0,
  parts: 240,
  touch: 240 + PARTS_FRAMES, // 600
  glass: 750,
  nest: 1020,
  size: 1095,
  burst: 1245,
  quiet: 1357,
  logo: 1373,
  end: 1440,
};
export const FILM2_FRAMES = F.end;

const SPRING = { damping: 18, stiffness: 140, mass: 1 };

/** Big words, one at a time, each landing on its frame. */
function Words({ f, words, left, top, size = 96 }: { f: number; words: [number, string][]; left?: number; top: number; size?: number }) {
  return (
    <Heading
      size="9"
      style={{ position: "absolute", left: left ?? 0, right: left === undefined ? 0 : undefined, top, fontSize: size, lineHeight: 1.02, letterSpacing: "-0.045em", textAlign: left === undefined ? "center" : "start", whiteSpace: "nowrap", zIndex: 40 }}
    >
      {words.map(([at, w], i) =>
        f >= at ? (
          <span key={i} style={{ display: "block", scale: `${1.06 - 0.06 * ramp(f, at, at + 4, out)}`, transformOrigin: "0 50%" }}>{w}</span>
        ) : null,
      )}
    </Heading>
  );
}

/* ── Touch: the desktop is flung to a phone ───────────────────────────────────────────── */

function Touch() {
  const f = useCurrentFrame();
  // The physics act lets go at its frame 24; shift it so the flick lands on a beat.
  return (
    <>
      <Physics f={Math.max(0, f - 6)} />
      <Words f={f} top={300} left={96} words={[[90, "Larger"], [97, "where you"], [104, "touch."]]} />
    </>
  );
}

/* ── Glass and dark: the act's three clicks moved onto beats ─────────────────────────── */

function Glass() {
  const f = useCurrentFrame();
  const a = track(f, [[0, 0], [60, G.regular], [120, G.thick], [180, G.dark], [270, G.end]], (t) => t);
  return <GlassAct f={a} />;
}

/* ── Corners: a slow push into the nested curves ──────────────────────────────────────── */

function Corners() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 20, stiffness: 50, mass: 1 } });
  return (
    <div style={{ position: "absolute", inset: 0, scale: `${lerp(0.92, 1.06, s)}`, transformOrigin: "20% 55%" }}>
      <Nest />
    </div>
  );
}

/* ── Size: one card steps from size 1 to 4, each step on a beat, growing on a spring ──── */

const STEPS = [15, 45, 75, 105];
const SIZES = ["1", "2", "3", "4"] as const;
const WIDTHS = [gx(6), gx(7), gx(8), gx(9)];

function Size() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  let i = 0;
  STEPS.forEach((at, k) => {
    if (f >= at) i = k;
  });
  const sp = spring({ frame: f - STEPS[i]!, fps, config: SPRING });
  const from = i === 0 ? WIDTHS[0]! * 0.85 : WIDTHS[i - 1]!;
  const scale = lerp(from / WIDTHS[i]!, 1, sp);
  const enter = spring({ frame: f, fps, config: SPRING });
  return (
    <World cam={{ x: W / 2, y: H / 2 - 40, s: 2.0 + 0.08 * ramp(f, 0, 150, (t) => t) }} width={W} height={H}>
      <div style={{ position: "absolute", left: W / 2 - WIDTHS[i]! / 2, top: H / 2 - 40, width: WIDTHS[i], translate: `0 -50%`, scale: `${scale * lerp(0.9, 1, enter)}`, opacity: Math.min(1, enter * 2) }}>
        <Theme size={SIZES[i]}>
          <Card>
            <Stack gap={(["2", "3", "4", "5"] as const)[i]}>
              <Text size={(["2", "3", "4", "5"] as const)[i]} weight="medium">Share project</Text>
              <TextField placeholder="Add people" aria-label="Add people" />
              <Flex gap="2" justify="end">
                <Button>Cancel</Button>
                <Button emphasis="loud">Share</Button>
              </Flex>
            </Stack>
          </Card>
        </Theme>
      </div>
    </World>
  );
}

/* ── Open, burst, logo: the sample's own sections ─────────────────────────────────────── */

function Intent() {
  const f = useCurrentFrame();
  return f < S.type1 ? <Open1 f={f} /> : <Statement f={f} />;
}

function BurstPart() {
  const f = useCurrentFrame();
  return <Burst f={S.burst + f} />;
}

function Logo() {
  const f = useCurrentFrame();
  const t = ramp(f, 0, 5, out);
  return (
    <div style={{ position: "absolute", inset: 0, scale: `${1.5 + 0.04 * ramp(f, 0, F.end - F.logo, (x) => x)}` }}>
      <Open t={t} />
    </div>
  );
}

function Quiet() {
  return <World cam={{ x: W / 2, y: H / 2, s: 1 }} width={W} height={H}>{null}</World>;
}

export function Film2() {
  const seq: [number, number, React.ReactNode][] = [
    [F.intent, F.parts, <Intent />],
    [F.parts, F.touch, <Parts />],
    [F.touch, F.glass, <Touch />],
    [F.glass, F.nest, <Glass />],
    [F.nest, F.size, <Corners />],
    [F.size, F.burst, <Size />],
    [F.burst, F.quiet, <BurstPart />],
    [F.quiet, F.logo, <Quiet />],
    [F.logo, F.end, <Logo />],
  ];
  return (
    <>
      {seq.map(([from, to, node], i) => (
        <Sequence key={i} from={from} durationInFrames={to - from}>
          {node}
        </Sequence>
      ))}
    </>
  );
}
