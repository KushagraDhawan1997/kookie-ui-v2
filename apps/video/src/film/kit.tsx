/**
 * Film kit: time helpers, the camera, the pointer and kinetic captions. Everything is a function
 * of the frame, so any frame renders the same every time.
 */
import * as React from "react";
import { Easing, interpolate, spring, useVideoConfig } from "remotion";
import { Heading } from "@kushagradhawan/kookie-ui-react";

export const W = 1440;
export const H = 810;
export const CELL = 48;
export const gx = (k: number) => k * CELL;
export const gy = (k: number) => 21 + k * CELL;
export const cells = (k: number) => k * CELL;

export const ease = Easing.bezier(0.65, 0, 0.35, 1);
export const out = Easing.bezier(0.16, 1, 0.3, 1);

/** 0..1 between frames a and b. */
export const ramp = (f: number, a: number, b: number, e = ease) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** A spring that starts at frame `at`. */
export function useSpring(f: number, at: number, config: { damping?: number; stiffness?: number; mass?: number } = {}) {
  const { fps } = useVideoConfig();
  return spring({ frame: f - at, fps, config: { damping: 18, stiffness: 140, mass: 1, ...config } });
}

/** The first `n` characters typed, at `per` frames per character from `at`. */
export const typed = (text: string, f: number, at: number, per = 2) =>
  text.slice(0, Math.max(0, Math.min(text.length, Math.floor((f - at) / per))));

/** The first words of a reply, streamed at `per` frames per word. */
export const streamed = (text: string, f: number, at: number, per = 2.4) => {
  const words = text.split(/(\s+)/);
  const n = Math.max(0, Math.floor((f - at) / per));
  return words.slice(0, n * 2).join("");
};

/** Keyframed value: [frame, value] pairs, eased between neighbours. */
export function track(f: number, keys: [number, number][], e = ease) {
  if (f <= keys[0]![0]) return keys[0]![1];
  for (let i = 1; i < keys.length; i++) {
    const [f1, v1] = keys[i]!;
    const [f0, v0] = keys[i - 1]!;
    if (f <= f1) return lerp(v0, v1, e((f - f0) / (f1 - f0)));
  }
  return keys[keys.length - 1]![1];
}

/* ── Camera ───────────────────────────────────────────────────────────────────────────── */

export type Cam = { x: number; y: number; s: number };

/** The world: a large grid plane the camera looks at. `x, y` is the world point at frame centre. */
export function World({ cam, width, height, children }: { cam: Cam; width: number; height: number; children: React.ReactNode }) {
  const line = "var(--neutral-a6)";
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "var(--neutral-4)" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width,
          height,
          transformOrigin: "0 0",
          transform: `translate(${W / 2}px, ${H / 2}px) scale(${cam.s}) translate(${-cam.x}px, ${-cam.y}px)`,
          backgroundImage: `linear-gradient(to right, ${line} 1px, transparent 1px), linear-gradient(to bottom, ${line} 1px, transparent 1px)`,
          backgroundSize: `${CELL}px ${CELL}px`,
          backgroundPosition: `0px 21px`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** Where an element sits in the world, from its offset chain (transforms do not change it). */
export function worldPoint(el: HTMLElement, root: HTMLElement) {
  let x = 0;
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== root) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return { x: x + el.offsetWidth / 2, y: y + el.offsetHeight / 2 };
}

/* ── Pointer ──────────────────────────────────────────────────────────────────────────── */

/** The package's own hover and press paints, stated inline: a film frame has no real pointer to set :hover. */
export const HOVER: React.CSSProperties = { backgroundColor: "var(--kui-ct-fill-hover, var(--kui-ct-fill-src-hover))" };
export const PRESS: React.CSSProperties = { backgroundColor: "var(--kui-ct-fill-active, var(--kui-ct-fill-src-active))" };
/** The package's focus ring, for a field the film shows as focused. */
export const FOCUS: React.CSSProperties = { outline: "var(--focus-ring-width) solid var(--focus-ring)", outlineOffset: "var(--focus-ring-offset)" };

/** The platform pointer: an arrow, or the text beam over a text field. `press` 0..1 pushes it in a little. */
export function Pointer({ x, y, press = 0, opacity = 1, kind = "arrow" }: { x: number; y: number; press?: number; opacity?: number; kind?: "arrow" | "text" }) {
  const shadow = "drop-shadow(0 2px 3px rgb(0 0 0 / 0.22))";
  if (kind === "text")
    return (
      <svg width={14} height={26} viewBox="0 0 14 26" style={{ position: "absolute", left: x - 7, top: y - 13, opacity, zIndex: 20, filter: shadow }}>
        <path d="M3 2.5 C5.5 2.5 7 3.3 7 5 V21 C7 22.7 5.5 23.5 3 23.5 M11 2.5 C8.5 2.5 7 3.3 7 5 M11 23.5 C8.5 23.5 7 22.7 7 21 M4.5 13 H9.5" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" />
        <path d="M3 2.5 C5.5 2.5 7 3.3 7 5 V21 C7 22.7 5.5 23.5 3 23.5 M11 2.5 C8.5 2.5 7 3.3 7 5 M11 23.5 C8.5 23.5 7 22.7 7 21 M4.5 13 H9.5" fill="none" stroke="#111" strokeWidth={1.4} strokeLinecap="round" />
      </svg>
    );
  return (
    <svg
      width={28}
      height={28}
      viewBox="0 0 28 28"
      style={{
        position: "absolute",
        left: x - 6,
        top: y - 4,
        opacity,
        zIndex: 20,
        pointerEvents: "none",
        transformOrigin: "6px 4px",
        transform: `scale(${1 - 0.14 * press})`,
        filter: shadow,
      }}
    >
      <path d="M6 4 L6 22 L10.6 17.6 L13.8 24.6 L16.9 23.2 L13.8 16.4 L20 16.4 Z" fill="#111" stroke="#fff" strokeWidth={1.6} strokeLinejoin="round" />
    </svg>
  );
}

/* ── Captions ─────────────────────────────────────────────────────────────────────────── */

/** A line that arrives word by word and leaves as one piece. Screen space, not world space. */
export function Kinetic({ text, f, inAt, outAt, top = 64 }: { text: string; f: number; inAt: number; outAt: number; top?: number }) {
  const words = text.split(" ");
  const leave = ramp(f, outAt, outAt + 14);
  if (f < inAt || leave >= 1) return null;
  return (
    <Heading
      size="9"
      style={{
        position: "absolute",
        left: 96,
        top,
        zIndex: 30,
        fontSize: 44,
        lineHeight: 1.1,
        letterSpacing: "-0.02em",
        opacity: 1 - leave,
        translate: `0 ${-12 * leave}px`,
        whiteSpace: "nowrap",
      }}
    >
      {words.map((w, i) => {
        const k = ramp(f, inAt + i * 3, inAt + i * 3 + 14, out);
        return (
          <span key={i} style={{ display: "inline-block", opacity: k, translate: `0 ${(1 - k) * 20}px`, filter: `blur(${(1 - k) * 6}px)` }}>
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </Heading>
  );
}
