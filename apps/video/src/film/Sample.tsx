/**
 * Sample cut, 14 seconds, cut to a 120 BPM grid (one beat = 15 frames). It tests the launch-film
 * playbook (/mnt/project-files/kookie-video/launch-film-playbook.md): macro cold open, crash
 * pull-back, big type word by word, a variation burst on half beats, silence, then the logo.
 */
import * as React from "react";
import { useCurrentFrame } from "remotion";
import { Heading, Theme } from "@kushagradhawan/kookie-ui-react";
import { Open } from "../../../docs/app/video/shots";
import { Chat, Deploy, Members, Plan, T } from "./Act1";
import { Pointer, World, W, H, follow, gx, gy, lerp, out, ramp, track, worldPoint } from "./kit";

const B = 15; // one beat
export const S = {
  click: 2 * B, // 30
  send: 5 * B, // 75
  wide: 5 * B + 12, // the crash pull-back lands
  type1: 10 * B, // 150
  type2: 13 * B, // 195
  burst: 16 * B, // 240
  hold: 22 * B, // 330: the burst slows on its last look
  quiet: 23 * B + 7, // 352: silence
  logo: 24 * B + 8, // 368
  end: 28 * B, // 420
};
export const SAMPLE_FRAMES = S.end;

/** Film frame → the act's own script frame. The boring parts (typing, building) are compressed. */
const act = (f: number) =>
  track(
    f,
    [
      [0, 0],
      [S.click, T.click1],
      [S.click + 6, T.type],
      [S.send - 11, T.type + 56],
      [S.send, T.send],
      [S.send + 3, T.sent],
      [88, T.kit - 2],
      [97, T.kit + 24],
      [100, T.seats],
      [105, T.seats + 26],
      [112, T.update - 2],
      [120, T.update + 32],
      [121, T.deploy + 6],
      [134, T.live - 2],
      [150, T.live + 60],
    ],
    (t) => t,
  );

const CHAT = { x: gx(20), y: gy(3), w: gx(9) };
const MEMBERS = { x: gx(1), y: gy(3), w: gx(18) };
const PLAN = { x: gx(31), y: gy(1), w: gx(9) };
const DEPLOY = { x: gx(41), y: gy(1), w: gx(9) };

/* ── 1–2: cold open and snap out ──────────────────────────────────────────────────────── */

export function Open1({ f }: { f: number }) {
  const a = act(f);
  const root = React.useRef<HTMLDivElement>(null);
  const [tg, setTg] = React.useState<Record<string, { x: number; y: number }>>({});
  React.useLayoutEffect(() => {
    if (!root.current) return;
    const next: Record<string, { x: number; y: number }> = {};
    root.current.querySelectorAll<HTMLElement>("[data-target]").forEach((el) => {
      next[el.dataset.target!] = worldPoint(el, root.current!);
    });
    if (JSON.stringify(next) !== JSON.stringify(tg)) setTg(next);
  });
  const input = tg.input ?? { x: 1170, y: 560 };
  const send = tg.send ?? { x: 1350, y: 610 };

  // Macro on the field. The camera settles once and holds while the words type, so the eye can read them;
  // a short spring push onto send, then the crash out.
  const tx = (t: number) => (t < S.click - 4 ? input.x : t < S.send - 8 ? input.x - 70 : send.x - 6);
  const ty = (t: number) => (t < S.click - 4 ? (input.y + send.y) / 2 : t < S.send - 8 ? input.y : send.y - 4);
  const ts = (t: number) => Math.log(t < S.click - 4 ? 3.1 : t < S.send - 8 ? 3.5 : 5);
  const near = (fr: number) => ({
    x: follow(fr, tx, 110, 19),
    y: follow(fr, ty, 110, 19),
    s: Math.exp(follow(fr, ts, 110, 19)),
  });
  const atSend = near(S.send);
  const k = f < S.send ? 0 : out((f - S.send) / (S.wide - S.send));
  const cam =
    f < S.send
      ? near(f)
      : {
          x: f < S.wide ? lerp(atSend.x, 1224, k) : 1224,
          y: f < S.wide ? lerp(atSend.y, 400, k) : lerp(400, 396, ramp(f, S.wide, S.type1)),
          // Scale: hard ease so the pull-back is a single snap, then a slow drift in.
          s: f < S.wide ? Math.exp(Math.log(atSend.s) + (Math.log(0.62) - Math.log(atSend.s)) * k) : 0.62 + 0.1 * ramp(f, S.wide, S.type1, (t) => t),
        };
  const blur = f >= S.send && f < S.wide + 4 ? 14 * Math.sin(Math.PI * Math.min(1, (f - S.send) / (S.wide + 4 - S.send))) : 0;

  const pressAt = (at: number) => ramp(f, at - 1, at + 1) * (1 - ramp(f, at + 2, at + 6, out));
  const px = track(f, [[6, input.x + 60], [S.click - 2, input.x - 70], [S.send - 16, input.x - 40], [S.send - 3, send.x + 1], [S.send + 6, send.x + 30]], out);
  const py = track(f, [[6, input.y + 50], [S.click - 2, input.y - 2], [S.click + 8, input.y + 46], [S.send - 16, input.y + 46], [S.send - 3, send.y + 3], [S.send + 6, send.y + 30]], out);
  const pointerOn = ramp(f, 4, 10) * (1 - ramp(f, S.send + 2, S.send + 6));

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", inset: 0, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
        <World cam={cam} width={gx(52)} height={H + gx(4)}>
          <div ref={root} style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: MEMBERS.x, top: MEMBERS.y, width: MEMBERS.w }}><Members f={a} /></div>
            <div style={{ position: "absolute", left: CHAT.x, top: CHAT.y, width: CHAT.w }}><Chat f={a} /></div>
            <div style={{ position: "absolute", left: PLAN.x, top: PLAN.y, width: PLAN.w }}><Plan f={a} /></div>
            <div style={{ position: "absolute", left: DEPLOY.x, top: DEPLOY.y, width: DEPLOY.w }}><Deploy f={a} /></div>
          </div>
        </World>
      </div>
      <Pointer
        x={W / 2 + (px - cam.x) * cam.s}
        y={H / 2 + (py - cam.y) * cam.s}
        press={Math.max(pressAt(S.click), pressAt(S.send))}
        opacity={pointerOn}
        kind={f >= S.click - 8 && f < S.send - 18 ? "text" : "arrow"}
      />
    </div>
  );
}

/* ── 3: the statement, word by word ───────────────────────────────────────────────────── */

const WORDS: [number, string, number][] = [
  // [frame, word, line]
  [S.type1, "You", 0],
  [S.type1 + 7, "give", 0],
  [S.type1 + 14, "the", 0],
  [S.type1 + 21, "intent.", 0],
  [S.type2, "Kookie UI", 0],
  [S.type2 + 8, "makes", 0],
  [S.type2 + 15, "the", 1],
  [S.type2 + 22, "result.", 1],
];

export function Statement({ f }: { f: number }) {
  const second = f >= S.type2;
  const words = WORDS.filter(([at]) => (second ? at >= S.type2 : at < S.type2) && f >= at);
  const from = second ? S.type2 : S.type1;
  const push = 1 + 0.05 * ramp(f, from, from + 45, (t) => t);
  const lines = [0, 1].map((l) => words.filter((w) => w[2] === l));
  return (
    <World cam={{ x: 720 + (f - S.type1) * 1.2, y: 405, s: push }} width={W * 3} height={H * 2}>
      <div style={{ position: "absolute", left: 720 + (f - S.type1) * 1.2 - W / 2, top: 0, width: W, height: H, display: "grid", placeItems: "center" }}>
        <Heading size="9" style={{ fontSize: 132, lineHeight: 1.02, letterSpacing: "-0.045em", textAlign: "center", whiteSpace: "nowrap" }}>
          {lines.map((ws, l) =>
            ws.length ? (
              <span key={l} style={{ display: "block" }}>
                {ws.map(([at, w], i) => {
                  const k = ramp(f, at, at + 4, out);
                  return (
                    <span key={i} style={{ display: "inline-block", scale: `${1.06 - 0.06 * k}`, opacity: 0.35 + 0.65 * k }}>
                      {w}
                      {i < ws.length - 1 ? " " : ""}
                    </span>
                  );
                })}
              </span>
            ) : null,
          )}
        </Heading>
      </div>
    </World>
  );
}

/* ── 4: the burst. One product, the theme flips under it on every half beat ───────────── */

type Look = { appearance: "light" | "dark"; radius?: "none" | "small" | "medium" | "large" | "full"; density?: "compact" | "default" | "comfortable"; contrast?: "normal" | "high"; cam: [number, number, number] };

const BP = { x: gx(8), y: gy(1) };
const BD = { x: gx(18), y: gy(1) };
const WIDE: [number, number, number] = [gx(17), 400, 0.98];
const LOOKS: Look[] = [
  { appearance: "dark", cam: WIDE },
  { appearance: "light", radius: "none", cam: [gx(12.5), 560, 2.1] },
  { appearance: "dark", radius: "full", cam: WIDE },
  { appearance: "light", density: "compact", cam: [gx(22.5), 150, 2.3] },
  { appearance: "dark", density: "comfortable", cam: WIDE },
  { appearance: "light", contrast: "high", cam: [gx(12.5), 690, 2.2] },
  { appearance: "dark", radius: "none", density: "compact", cam: WIDE },
  { appearance: "light", radius: "large", cam: [gx(22.5), 330, 2.0] },
  { appearance: "dark", radius: "small", cam: WIDE },
  { appearance: "light", radius: "full", density: "comfortable", cam: [gx(12.5), 300, 1.9] },
  { appearance: "dark", contrast: "high", cam: WIDE },
  { appearance: "light", radius: "none", cam: [gx(22.5), 520, 2.2] },
];

export function Burst({ f }: { f: number }) {
  const g = f - S.burst;
  const i = Math.min(LOOKS.length, Math.floor(g / 7.5));
  const look: Look = i < LOOKS.length ? LOOKS[i]! : { appearance: "light", cam: WIDE };
  const local = i < LOOKS.length ? g - i * 7.5 : f - S.hold;
  // The camera keeps moving through every cut, so the cuts read as one move.
  const drift = i < LOOKS.length ? 1 + 0.012 * local : 1 + 0.06 * ramp(f, S.hold, S.quiet, out);
  const [x, y, s] = look.cam;
  return (
    <Theme appearance={look.appearance} radius={look.radius ?? "full"} density={look.density ?? "default"} contrast={look.contrast ?? "normal"} style={{ position: "absolute", inset: 0 }}>
      <World cam={{ x: x + local * 1.5, y, s: s * drift }} width={gx(40)} height={H * 2}>
        <div style={{ position: "absolute", left: BP.x, top: BP.y, width: gx(9) }}><Plan f={T.live + 60} /></div>
        <div style={{ position: "absolute", left: BD.x, top: BD.y, width: gx(9) }}><Deploy f={T.live + 60} /></div>
      </World>
    </Theme>
  );
}

/* ── The cut ──────────────────────────────────────────────────────────────────────────── */

export function Sample() {
  const f = useCurrentFrame();
  if (f < S.type1) return <Open1 f={f} />;
  if (f < S.burst) return <Statement f={f} />;
  if (f < S.quiet) return <Burst f={f} />;
  if (f < S.logo) return <World cam={{ x: 720, y: 405, s: 1 }} width={W} height={H}>{null}</World>;
  const t = ramp(f, S.logo, S.logo + 5, out);
  return (
    <div style={{ position: "absolute", inset: 0, scale: `${1.5 + 0.04 * ramp(f, S.logo, S.end, (x) => x)}` }}>
      <Open t={t} />
    </div>
  );
}
