/**
 * Physics sample: a desktop window is flicked down to a phone. The frame leads, every control
 * follows on its own spring (mass and a small delay by distance), so the parts carry inertia and
 * settle with a little overshoot. On the phone the controls are larger, so each one grows as it lands.
 *
 * Method: the two layouts render hidden and are measured; each part then flies from its desktop box
 * to its phone box. A part renders its phone content, scaled down to its desktop height and up to 1.
 */
import * as React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  Button,
  Card,
  Flex,
  Heading,
  SegmentedControl,
  SegmentedItem,
  Slider,
  Stack,
  Switch,
  Text,
  TextField,
  Theme,
} from "@kushagradhawan/kookie-ui-react";
import { BellIcon, ChartIcon, FolderIcon, HomeIcon, SearchIcon, SettingsIcon, UsersIcon } from "../../../docs/app/icons";
import { Pointer, World, W, H, lerp, out, ramp, track } from "./kit";

export const PHYSICS_FRAMES = 150;

const NAV = [
  ["Overview", <HomeIcon key="i" />],
  ["Projects", <FolderIcon key="i" />],
  ["Members", <UsersIcon key="i" />],
  ["Notifications", <BellIcon key="i" />],
  ["Usage", <ChartIcon key="i" />],
  ["Settings", <SettingsIcon key="i" />],
] as const;

const ROWS = [
  ["Mentions", "When someone names you"],
  ["Replies", "Answers to your threads"],
  ["Deploys", "When a deploy goes live"],
  ["Billing", "Invoices and seat changes"],
] as const;

type Part = { k: string; node: React.ReactNode; grow?: boolean };

/** The parts both layouts share, by key. */
function parts(): Record<string, React.ReactNode> {
  const p: Record<string, React.ReactNode> = {
    title: (
      <Stack gap="1">
        <Heading size="6">Notifications</Heading>
        <Text emphasis="medium" style={{ whiteSpace: "nowrap" }}>Choose what reaches you</Text>
      </Stack>
    ),
    search: <TextField placeholder="Search" leading={<SearchIcon />} aria-label="Search" style={{ width: "100%" }} />,
    seg: (
      <SegmentedControl defaultValue="all" aria-label="Show" style={{ width: "100%" }}>
        <SegmentedItem value="all">All</SegmentedItem>
        <SegmentedItem value="direct">Direct</SegmentedItem>
        <SegmentedItem value="none">None</SegmentedItem>
      </SegmentedControl>
    ),
    quiet: (
      <Stack gap="3">
        <Flex justify="space-between"><Text weight="medium">Quiet hours</Text><Text emphasis="medium">22:00 to 07:00</Text></Flex>
        <Slider defaultValue={[30, 75]} aria-label="Quiet hours" />
      </Stack>
    ),
    save: <Button emphasis="loud" style={{ width: "100%" }}>Save</Button>,
  };
  ROWS.forEach(([label, sub], i) => {
    p[`row${i}`] = (
      <Flex align="center" justify="space-between" gap="4">
        <Stack gap="1" minWidth="0">
          <Text weight="medium">{label}</Text>
          <Text size="2" emphasis="medium" style={{ whiteSpace: "nowrap" }}>{sub}</Text>
        </Stack>
        <Switch defaultChecked={i !== 3} aria-label={label} />
      </Flex>
    );
  });
  return p;
}

/** Desktop-only and phone-only parts. */
const navPart = (i: number) => (
  <Button emphasis={i === 3 ? "medium" : "quiet"} leading={NAV[i]![1]} style={{ width: "100%", justifyContent: "flex-start" }}>
    {NAV[i]![0]}
  </Button>
);
const tabsPart = (
  <Flex justify="space-around" align="center">
    {[0, 1, 3, 5].map((i) => (
      <Button key={i} iconOnly emphasis={i === 3 ? "medium" : "quiet"} aria-label={NAV[i]![0]}>{NAV[i]![1]}</Button>
    ))}
  </Flex>
);

const DESK = { x: 150, y: 185, w: 1140, h: 440 };
const PHONE = { x: 525, y: 22, w: 390, h: 766 };

function Desktop({ p }: { p: Record<string, React.ReactNode> }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px minmax(0, 1fr)", gap: 40, padding: 32, width: DESK.w, height: DESK.h, boxSizing: "border-box" }}>
      <Stack gap="1">
        {NAV.map((_, i) => <div key={i} data-k={`nav${i}`}>{navPart(i)}</div>)}
      </Stack>
      <Stack gap="5">
        <Flex justify="space-between" align="center" gap="6">
          <div data-k="title">{p.title}</div>
          <div data-k="search" style={{ width: 260 }}>{p.search}</div>
        </Flex>
        <div data-k="seg" style={{ width: 300 }}>{p.seg}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 40, rowGap: 20 }}>
          {ROWS.map((_, i) => <div key={i} data-k={`row${i}`}>{p[`row${i}`]}</div>)}
        </div>
        <Flex gap="7" align="flex-end">
          <div data-k="quiet" style={{ flex: 1 }}>{p.quiet}</div>
          <div data-k="save" style={{ width: 120 }}>{p.save}</div>
        </Flex>
      </Stack>
    </div>
  );
}

function Phone({ p }: { p: Record<string, React.ReactNode> }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "40px 22px 18px", width: PHONE.w, height: PHONE.h, boxSizing: "border-box" }}>
      <div data-k="title">{p.title}</div>
      <div data-k="search">{p.search}</div>
      <div data-k="seg">{p.seg}</div>
      <Stack gap="4">
        {ROWS.map((_, i) => <div key={i} data-k={`row${i}`}>{p[`row${i}`]}</div>)}
      </Stack>
      <div data-k="quiet">{p.quiet}</div>
      <div data-k="save">{p.save}</div>
      <div style={{ flex: 1 }} />
      <div data-k="tabs">{tabsPart}</div>
    </div>
  );
}

type Box = { x: number; y: number; w: number; h: number };

function measure(root: HTMLElement | null): Record<string, Box> {
  const out: Record<string, Box> = {};
  if (!root) return out;
  const base = root.getBoundingClientRect();
  const k = base.width / root.offsetWidth || 1;
  root.querySelectorAll<HTMLElement>("[data-k]").forEach((el) => {
    const r = el.getBoundingClientRect();
    out[el.dataset.k!] = { x: (r.left - base.left) / k, y: (r.top - base.top) / k, w: r.width / k, h: r.height / k };
  });
  return out;
}

const FLICK = 24; // the pointer lets go

export function Physics() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = React.useMemo(parts, []);
  const deskRef = React.useRef<HTMLDivElement>(null);
  const phoneRef = React.useRef<HTMLDivElement>(null);
  const [m, setM] = React.useState<{ d: Record<string, Box>; p: Record<string, Box> } | null>(null);
  React.useLayoutEffect(() => {
    const next = { d: measure(deskRef.current), p: measure(phoneRef.current) };
    if (JSON.stringify(next) !== JSON.stringify(m)) setM(next);
  });

  // The window: dragged a little by the pointer, then flung to the phone on a stiff spring.
  const drag = ramp(f, 14, FLICK, (t) => t * t);
  const frame = spring({ frame: f - FLICK, fps, config: { mass: 1, damping: 15, stiffness: 120 } });
  const pre: Box = { x: DESK.x + 30 * drag, y: DESK.y + 10 * drag, w: DESK.w - 120 * drag, h: DESK.h - 20 * drag };
  const win: Box = f < FLICK ? pre : { x: lerp(pre.x, PHONE.x, frame), y: lerp(pre.y, PHONE.y, frame), w: lerp(pre.w, PHONE.w, frame), h: lerp(pre.h, PHONE.h, frame) };
  const radius = lerp(24, 52, Math.min(1.2, Math.max(0, frame)));

  // The pointer rides the window's corner until it lets go.
  const corner = { x: win.x + win.w, y: win.y + win.h };
  const px = track(f, [[0, corner.x + 160], [12, DESK.x + DESK.w - 2]], out) + (f >= 12 ? corner.x - (DESK.x + DESK.w) : 0);
  const py = track(f, [[0, corner.y + 120], [12, DESK.y + DESK.h - 2]], out) + (f >= 12 ? corner.y - (DESK.y + DESK.h) : 0);
  const pointerOn = ramp(f, 2, 8) * (1 - ramp(f, FLICK + 2, FLICK + 8));
  const press = ramp(f, 12, 14) * (1 - ramp(f, FLICK, FLICK + 3));

  const keys = m ? Array.from(new Set([...Object.keys(m.d), ...Object.keys(m.p)])) : [];
  const fly = keys.map((k) => {
    const d = m!.d[k];
    const ph = m!.p[k];
    // Parts nearer the corner the pointer flung leave first; the far ones lag.
    const lag = d && !ph ? 0 : d ? Math.round((1 - (d.x + d.y) / (DESK.w + DESK.h)) * 4) : 3;
    const mass = d && !ph ? 0.6 : d && ph ? 0.8 + (d.h / 80) * 0.25 : 0.9;
    const s = spring({ frame: f - FLICK - lag, fps, config: { mass, damping: 17, stiffness: 140 } });
    // Position settles firmly; size keeps the bounce, so a control grows past its phone size and back.
    const g = spring({ frame: f - FLICK - lag - 2, fps, config: { mass, damping: 16, stiffness: 150 } });
    return { k, d, ph, s, g };
  });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <World cam={{ x: W / 2, y: H / 2 + 0 * ramp(f, 60, 150, out), s: 1 + 0.05 * ramp(f, 55, 150, out) }} width={W} height={H}>
        {/* Hidden measures. */}
        <div style={{ position: "absolute", left: 0, top: 0, visibility: "hidden" }}>
          <Theme pointer="fine"><div ref={deskRef}><Desktop p={p} /></div></Theme>
        </div>
        <div style={{ position: "absolute", left: 0, top: 0, visibility: "hidden" }}>
          <Theme pointer="coarse"><div ref={phoneRef}><Phone p={p} /></div></Theme>
        </div>
        {/* The window. */}
        <div style={{ position: "absolute", left: win.x, top: win.y, width: win.w, height: win.h }}>
          <Card size="2" style={{ position: "absolute", inset: 0, padding: 0, borderRadius: radius }} />
        </div>
        {/* The parts, clipped by the window, so they slosh inside it. Each flies on its own spring. */}
        <div style={{ position: "absolute", left: win.x, top: win.y, width: win.w, height: win.h, overflow: "clip", borderRadius: radius }}>
        {fly.map(({ k, d, ph, s, g }) => {
          if (d && !ph) {
            // Desktop only: the sidebar is thrown off to the left and fades.
            const x = (d.x * win.w) / (f < FLICK ? DESK.w : lerp(DESK.w, PHONE.w, frame)) - 360 * Math.max(0, s);
            return (
              <div key={k} style={{ position: "absolute", left: x, top: d.y, width: d.w, opacity: Math.max(0, 1 - s * 1.3) }}>
                <Theme pointer="fine">{navPart(Number(k.slice(3)))}</Theme>
              </div>
            );
          }
          if (!d && ph) {
            // Phone only: the tab bar rises into place.
            return (
              <div key={k} style={{ position: "absolute", left: ph.x, top: ph.y + 140 * (1 - s), width: ph.w, opacity: Math.min(1, Math.max(0, s * 1.4)) }}>
                <Theme pointer="coarse">{tabsPart}</Theme>
              </div>
            );
          }
          if (!d || !ph) return null;
          // Shared: the box flies from its desktop place to its phone place, relative to the moving window.
          const t = f < FLICK ? 0 : s;
          const rel = { x: lerp(d.x, ph.x, t), y: lerp(d.y, ph.y, t), w: lerp(d.w, ph.w, t) };
          const startW = f < FLICK ? pre.w / DESK.w : 1;
          const left = rel.x * startW;
          const w = rel.w * startW;
          // Two renders cross over mid-flight: the desktop part grows to the phone height, the phone part grows from the desktop height.
          const tg = f < FLICK ? 0 : g;
          const sf = lerp(1, ph.h / d.h, tg);
          const sc = lerp(d.h / ph.h, 1, tg);
          const mix = Math.min(1, Math.max(0, (Math.min(t, tg) - 0.3) / 0.3));
          return (
            <React.Fragment key={k}>
              {mix < 1 ? (
                <div style={{ position: "absolute", left, top: rel.y, width: w / sf, transformOrigin: "0 0", scale: `${sf}`, opacity: 1 - mix }}>
                  <Theme pointer="fine">{p[k]}</Theme>
                </div>
              ) : null}
              {mix > 0 ? (
                <div style={{ position: "absolute", left, top: rel.y, width: w / sc, transformOrigin: "0 0", scale: `${sc}`, opacity: mix }}>
                  <Theme pointer="coarse">{p[k]}</Theme>
                </div>
              ) : null}
            </React.Fragment>
          );
        })}
        </div>
      </World>
      <Pointer x={px} y={py} press={press} opacity={pointerOn} kind={f >= 8 ? "resize" : "arrow"} />
    </div>
  );
}
