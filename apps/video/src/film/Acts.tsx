/**
 * Acts 2 to 6. Each act is one moving shot; acts meet by a continuous move or a whip pan, never a
 * held cut. Every surface is a real package component in a real state.
 */
import * as React from "react";
import { useCurrentFrame } from "remotion";
import {
  Card,
  Flex,
  SegmentedControl,
  SegmentedItem,
  Separator,
  Switch,
  Text,
  Theme,
} from "@kushagradhawan/kookie-ui-react";
import { App, Nest, Open, Pill, SizeSnap, TouchType, CaptionIn } from "../../../docs/app/video/shots";
import { Notifications, SignIn } from "../../../docs/app/preview/showcase";
import { Chat, Deploy, Members, Plan } from "./Act1";
import { HOVER, Kinetic, Pointer, World, W, H, CELL, gx, gy, out, ramp, track, whip } from "./kit";

const DONE = 99999; // a frame long after every Act 1 change: the screens in their final state

/* ── Act 2: glass, then dark ──────────────────────────────────────────────────────────── */

export const G = {
  barIn: 18,
  regular: 104,
  thick: 166,
  dark: 236,
  end: 372,
};
export const GLASS_FRAMES = G.end;

type Rung = "thin" | "regular" | "thick";

/** The column of real screens the camera scrolls through. Plan and Deploy sit where Act 1 left them. */
function Column() {
  return (
    <>
      <div style={{ position: "absolute", left: gx(31), top: gy(1), width: gx(9) }}><Plan f={DONE} /></div>
      <div style={{ position: "absolute", left: gx(41), top: gy(1), width: gx(9) }}><Deploy f={DONE} /></div>
      <div style={{ position: "absolute", left: gx(31), top: gy(15), width: gx(9) }}><Chat f={DONE} /></div>
      <div style={{ position: "absolute", left: gx(41), top: gy(12), width: gx(9) }}><Notifications /></div>
      <div style={{ position: "absolute", left: gx(41), top: gy(23), width: gx(9) }}><SignIn /></div>
      <div style={{ position: "absolute", left: gx(31), top: gy(26), width: gx(18) }}><Members f={DONE} /></div>
    </>
  );
}

/** The floating bar: glass over the scrolling screens. It holds the controls the pointer uses. */
function Bar({ rung, dark, hover }: { rung: Rung; dark: boolean; hover: string | null }) {
  return (
    <Theme material={rung} size="3">
      <Card backdrop size="2">
        <Flex align="center" gap="4">
          <SegmentedControl value={rung} aria-label="Glass" style={{ width: 340 }}>
            {(["thin", "regular", "thick"] as const).map((r) => (
              <SegmentedItem key={r} value={r} data-target={r} style={hover === r ? HOVER : undefined}>
                {r[0]!.toUpperCase() + r.slice(1)}
              </SegmentedItem>
            ))}
          </SegmentedControl>
          <Separator orientation="vertical" style={{ blockSize: 28 }} />
          <Flex align="center" gap="3">
            <Text weight="medium">Dark</Text>
            <span data-target="dark" style={{ display: "inline-flex" }}>
              <Switch checked={dark} aria-label="Dark" />
            </span>
          </Flex>
        </Flex>
      </Card>
    </Theme>
  );
}

function GlassLayer({ f, dark, rung, hover }: { f: number; dark: boolean; rung: Rung; hover: string | null }) {
  const speed = ramp(f, 0, 50, out);
  const y = 405 + scrollAt(f) * speed;
  const barIn = ramp(f, G.barIn, G.barIn + 22, out);
  return (
    <Theme appearance={dark ? "dark" : "light"} style={{ position: "absolute", inset: 0 }}>
      <World cam={{ x: gx(36.5), y, s: 1 }} width={gx(52)} height={gy(40)}>
        <Column />
      </World>
      <div style={{ position: "absolute", top: 40, left: 456, width: 912, display: "flex", justifyContent: "center", zIndex: 10, translate: `0 ${(1 - barIn) * -110}px` }}>
        <Bar rung={rung} dark={dark} hover={hover} />
      </div>
    </Theme>
  );
}

/** How far the screens have scrolled, in px: a steady drift. */
const scrollAt = (f: number) => f * 2.6;

export function GlassAct() {
  const f = useCurrentFrame();
  const root = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<Record<string, { x: number; y: number }>>({});
  React.useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const base = el.getBoundingClientRect();
    const k = base.width / W;
    const next: Record<string, { x: number; y: number }> = {};
    el.querySelectorAll<HTMLElement>("[data-light] [data-target]").forEach((t) => {
      const b = t.getBoundingClientRect();
      next[t.dataset.target!] = { x: (b.left - base.left + b.width / 2) / k, y: (b.top - base.top + b.height / 2) / k };
    });
    if (JSON.stringify(next) !== JSON.stringify(pos)) setPos(next);
  });

  const rung: Rung = f < G.regular + 2 ? "thin" : f < G.thick + 2 ? "regular" : "thick";
  const dark = f >= G.dark + 2;
  const reg = pos.regular ?? { x: 800, y: 60 };
  const thk = pos.thick ?? { x: 890, y: 60 };
  const sw = pos.dark ?? { x: 1100, y: 60 };
  const px = track(f, [[G.regular - 40, reg.x + 120], [G.regular - 4, reg.x + 6], [G.thick - 34, reg.x + 10], [G.thick - 4, thk.x + 6], [G.dark - 38, thk.x + 40], [G.dark - 4, sw.x + 4], [G.dark + 40, sw.x + 90]], out);
  const py = track(f, [[G.regular - 40, reg.y + 220], [G.regular - 4, reg.y + 4], [G.thick - 34, reg.y + 6], [G.thick - 4, thk.y + 4], [G.dark - 38, thk.y + 30], [G.dark - 4, sw.y + 4], [G.dark + 40, sw.y + 120]], out);
  const on = ramp(f, G.regular - 44, G.regular - 34) * (1 - ramp(f, G.dark + 30, G.dark + 44));
  const press = Math.max(...[G.regular, G.thick, G.dark].map((a) => ramp(f, a - 2, a + 1) * (1 - ramp(f, a + 3, a + 9, out))));
  const hover = f >= G.regular - 8 && f < G.regular ? "regular" : f >= G.thick - 8 && f < G.thick ? "thick" : null;

  // Dark arrives as a circle growing out of the switch.
  const r = ramp(f, G.dark + 2, G.dark + 34, out) * 1800;
  return (
    <div ref={root} style={{ position: "absolute", inset: 0 }}>
      <div data-light style={{ position: "absolute", inset: 0 }}>
        <GlassLayer f={f} dark={false} rung={rung} hover={hover} />
      </div>
      {f >= G.dark ? (
        <div style={{ position: "absolute", inset: 0, clipPath: `circle(${r}px at ${sw.x}px ${sw.y}px)` }}>
          <GlassLayer f={f} dark rung={rung} hover={null} />
        </div>
      ) : null}
      <Pointer x={px} y={py} press={press} opacity={on} />
      <Theme appearance={f >= G.dark + 20 ? "dark" : "light"} style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "transparent", zIndex: 30 }}>
        <Kinetic text={"Glass shows what\nmoves behind it."} f={f} inAt={30} outAt={G.dark - 20} top={330} />
        <Kinetic text={"It adapts to\nlight and dark."} f={f} inAt={G.dark + 26} outAt={G.end - 4} top={330} />
      </Theme>
    </div>
  );
}

/* ── Act 3: one interface, desktop to phone ───────────────────────────────────────────── */

export const D = { grab: 40, release: 176, end: 250 };
export const DEVICE_FRAMES = D.end;

export function DeviceAct() {
  const f = useCurrentFrame();
  const p = ramp(f, D.grab + 6, D.release - 4);
  const w = 20 - 12 * p;
  const side = Math.max(0, 1 - p * 1.6);
  const coarse = f >= D.release + 8;
  const left = gx(15 - w / 2);
  const edge = { x: left + w * CELL, y: gy(5) + 5 * CELL };
  const px = f < D.grab ? track(f, [[8, edge.x + 220], [D.grab - 4, edge.x]], out) : edge.x;
  const py = f < D.grab ? track(f, [[8, edge.y + 160], [D.grab - 4, edge.y]], out) : edge.y;
  const on = ramp(f, 6, 14) * (1 - ramp(f, D.release + 4, D.release + 16));
  const press = f >= D.grab - 2 && f < D.release ? ramp(f, D.grab - 2, D.grab + 2) : 0;
  const cam = { x: 720 - 30 * ramp(f, 0, D.end, (t) => t), y: 405, s: 1.02 + 0.06 * ramp(f, 0, D.end, (t) => t) };
  return (
    <div style={{ ...whip(f, D.end), background: "var(--neutral-4)" }}>
      <World cam={cam} width={W * 2} height={H * 2}>
        <div style={{ position: "absolute", left, top: gy(5) }}>
          <Theme pointer={coarse ? "coarse" : "fine"}>
            <Card size="1" style={{ width: w * CELL, height: 10 * CELL, padding: 0, borderRadius: 16 + 24 * p, overflow: "hidden" }}>
              <App side={side} />
            </Card>
          </Theme>
        </div>
      </World>
      <Pointer x={W / 2 + (px - cam.x) * cam.s} y={H / 2 + (py - cam.y) * cam.s} press={press} opacity={on} kind={f >= D.grab - 14 ? "resize" : "arrow"} />
      <Kinetic text="You make the interface one time." f={f} inAt={10} outAt={D.release - 30} top={64} />
      <Kinetic text={"On a touch screen,\nthe controls are larger."} f={f} inAt={D.release - 10} outAt={D.end} top={64} />
    </div>
  );
}

/* ── Act 4: little details, one look each ─────────────────────────────────────────────── */

export const DETAIL = 72;
export const DETAILS_FRAMES = DETAIL * 3;

function Detail({ f, children, push = 0.05, dx = 0 }: { f: number; children: React.ReactNode; push?: number; dx?: number }) {
  const t = ramp(f, 0, DETAIL, (x) => x);
  return (
    <div style={whip(f, DETAIL, { k: 8 })}>
      <CaptionIn.Provider value={ramp(f, 4, 18, out)}>
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${-dx * t}px) scale(${1 + push * t})`, transformOrigin: "50% 60%" }}>{children}</div>
      </CaptionIn.Provider>
    </div>
  );
}

export function DetailsAct() {
  const f = useCurrentFrame();
  const beat = Math.min(2, Math.floor(f / DETAIL));
  const g = f - beat * DETAIL;
  return (
    <>
      {beat === 0 ? <Detail f={g}><Pill /></Detail> : null}
      {beat === 1 ? <Detail f={g} push={0.08} dx={60}><Nest /></Detail> : null}
      {beat === 2 ? <Detail f={g}><TouchType /></Detail> : null}
    </>
  );
}

/* ── Act 5: everything scales together ────────────────────────────────────────────────── */

export const LINEUP_FRAMES = 150;

export function LineupAct() {
  const f = useCurrentFrame();
  const back = ramp(f, 0, LINEUP_FRAMES, out);
  return (
    <div style={whip(f, LINEUP_FRAMES, { exit: false })}>
      <CaptionIn.Provider value={ramp(f, 30, 46, out)}>
        <div style={{ position: "absolute", inset: 0, transform: `scale(${1.14 - 0.14 * back})`, transformOrigin: "50% 80%" }}>
          <SizeSnap t={ramp(f, 4, 56, out)} />
        </div>
      </CaptionIn.Provider>
      <div style={{ position: "absolute", inset: 0, background: "var(--neutral-4)", opacity: ramp(f, LINEUP_FRAMES - 14, LINEUP_FRAMES) }} />
    </div>
  );
}

/* ── Act 6: close ─────────────────────────────────────────────────────────────────────── */

export const CLOSE_FRAMES = 120;

export function CloseAct() {
  const f = useCurrentFrame();
  return <Open t={ramp(f, 6, 40, out)} />;
}

