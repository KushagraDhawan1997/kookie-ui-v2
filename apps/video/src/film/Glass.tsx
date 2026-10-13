/**
 * Glass, then dark. Two layers scroll at two speeds: solid screens behind, glass screens in front,
 * so real content passes under the glass and the lens bends it at every edge. The glass thickens on
 * two beats, then dark grows out from the right.
 *
 * Glass is never zoomed (the lens is built for the box it measures), so this shot holds the camera
 * at scale 1 and moves only by scrolling.
 */
import * as React from "react";
import { useCurrentFrame } from "remotion";
import { Box, Theme } from "@kushagradhawan/kookie-ui-react";
import { Notifications, SignIn } from "../../../docs/app/preview/showcase";
import { Chat, Deploy, Members, Plan } from "./Act1";
import { Kinetic, World, W, H, gx, gy, out, ramp } from "./kit";

const DONE = 99999;

export const GL = { regular: 60, thick: 120, dark: 180, end: 270 };
export const GLASS2_FRAMES = GL.end;

type Rung = "thin" | "regular" | "thick";

const BACK_SPEED = 2.4; // px per frame
const FRONT_SPEED = 4.2;

/** Solid screens, the back layer. */
function Back() {
  return (
    <>
      <div style={{ position: "absolute", left: gx(31), top: gy(1), width: gx(9) }}><Plan f={DONE} /></div>
      <div style={{ position: "absolute", left: gx(41), top: gy(2), width: gx(9) }}><Deploy f={DONE} /></div>
      <div style={{ position: "absolute", left: gx(31), top: gy(16), width: gx(18) }}><Members f={DONE} /></div>
      <div style={{ position: "absolute", left: gx(41), top: gy(30), width: gx(9) }}><SignIn /></div>
    </>
  );
}

/** Glass screens, the front layer. They straddle the two back columns, so content passes under both edges. */
function Front({ rung }: { rung: Rung }) {
  return (
    <Theme material={rung}>
      <Box backdrop>
        <div style={{ position: "absolute", left: gx(36), top: gy(7), width: gx(9) }}><Notifications /></div>
        <div style={{ position: "absolute", left: gx(33), top: gy(24), width: gx(9) }}><Chat f={DONE} /></div>
        <div style={{ position: "absolute", left: gx(38), top: gy(40), width: gx(9) }}><Plan f={DONE} /></div>
      </Box>
    </Theme>
  );
}

function Layer({ f, dark, rung }: { f: number; dark: boolean; rung: Rung }) {
  const ease = ramp(f, 0, 40, out); // the scroll starts moving, then keeps a steady drift
  const t = Math.max(0, f - 20 * (1 - ease));
  const back = t * BACK_SPEED;
  const front = t * FRONT_SPEED;
  return (
    <Theme appearance={dark ? "dark" : "light"} style={{ position: "absolute", inset: 0 }}>
      <World cam={{ x: gx(31) + 220, y: 405 + back, s: 1 }} width={gx(52)} height={gy(70)}>
        <Back />
        <div style={{ position: "absolute", inset: 0, translate: `0 ${back - front}px` }}>
          <Front rung={rung} />
        </div>
      </World>
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
