/**
 * Glass, then dark. Every screen is glass and scrolls over a line grid that holds still, so the lines
 * slide under the glass. The glass thickens on two beats, then dark grows out from the right.
 *
 * Glass is never zoomed (the lens is built for the box it measures), so this shot holds the camera
 * at scale 1 and moves only by scrolling.
 *
 * Render with `--gl=swangle`. Chromium's CPU raster path offsets the lens's displacement by the
 * pane's own position, so every pane away from the origin draws stretched columns and no lines.
 * The GPU path (ANGLE on SwiftShader) draws the bend correctly.
 */
import * as React from "react";
import { useCurrentFrame } from "remotion";
import { Box, Theme } from "@kushagradhawan/kookie-ui-react";
import { Notifications, SignIn } from "../../../docs/app/preview/showcase";
import { Chat, Deploy, Members, Plan } from "./Act1";
import { Kinetic, W, H, gx, gy, out, ramp } from "./kit";

const DONE = 99999;

export const GL = { regular: 60, thick: 120, dark: 180, end: 270 };
export const GLASS2_FRAMES = GL.end;

type Rung = "thin" | "regular" | "thick";

const SPEED = 3; // px per frame

// Screen positions on the grid, in px at camera scroll 0. Two columns that never overlap.
const X0 = 500;
const COL = [X0, X0 + gx(10)];
const SCREENS: [number, number, number, React.ReactNode][] = [
  [COL[0]!, gy(1), gx(9), <Plan f={DONE} />],
  [COL[1]!, gy(1), gx(9), <Deploy f={DONE} />],
  [COL[1]!, gy(12), gx(9), <Notifications />],
  [COL[0]!, gy(15), gx(9), <Chat f={DONE} />],
  [COL[1]!, gy(24), gx(9), <SignIn />],
  [COL[0]!, gy(32), gx(19), <Members f={DONE} />],
];

/**
 * The scroll is layout, not a transform. A glass pane under a transformed ancestor sampled its
 * backdrop from the untransformed spot, so it showed other screens' content inside it.
 */
function Layer({ f, dark, rung }: { f: number; dark: boolean; rung: Rung }) {
  const ease = ramp(f, 0, 40, out); // the scroll starts moving, then keeps a steady drift
  const scroll = Math.round(Math.max(0, f - 20 * (1 - ease)) * SPEED);
  // Heavier lines than the other shots: the glass softens what it bends, and the lines are what it bends.
  const line = "var(--neutral-a8)";
  return (
    <Theme appearance={dark ? "dark" : "light"} style={{ position: "absolute", inset: 0 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          background: "var(--neutral-4)",
          backgroundImage: `linear-gradient(to right, ${line} 1px, transparent 1px), linear-gradient(to bottom, ${line} 1px, transparent 1px)`,
          backgroundSize: `${gx(1)}px ${gy(1) - gy(0)}px`,
          // The grid holds still while the screens scroll, so the lines slide under the glass.
          backgroundPosition: `${X0 % gx(1)}px 21px`,
        }}
      >
        <Theme material={rung}>
          <Box backdrop>
            {SCREENS.map(([x, y, w, node], i) => (
              <div key={i} style={{ position: "absolute", left: x, top: y - scroll, width: w }}>{node}</div>
            ))}
          </Box>
        </Theme>
      </div>
    </Theme>
  );
}

export function GlassScroll() {
  const f = useCurrentFrame();
  const rung: Rung = f < GL.regular ? "thin" : f < GL.thick ? "regular" : "thick";
  // Dark grows out of a point at the right edge of the frame.
  const origin = { x: W - 120, y: H / 2 };
  const r = ramp(f, GL.dark, GL.dark + 30, out) * 1800;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Layer f={f} dark={false} rung={rung} />
      {f >= GL.dark ? (
        <div style={{ position: "absolute", inset: 0, clipPath: `circle(${r}px at ${origin.x}px ${origin.y}px)` }}>
          <Layer f={f} dark rung={rung} />
        </div>
      ) : null}
      <Theme appearance={f >= GL.dark + 16 ? "dark" : "light"} style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "transparent", zIndex: 30 }}>
        <Kinetic text={"Glass shows\nwhat moves\nbehind it."} f={f} inAt={20} outAt={GL.dark - 20} top={300} />
        <Kinetic text={"It adapts\nto light\nand dark."} f={f} inAt={GL.dark + 20} outAt={GL.end - 4} top={300} />
      </Theme>
    </div>
  );
}
