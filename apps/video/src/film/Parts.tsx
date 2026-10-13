/**
 * Made of parts. The members screen comes apart into a wall of the system's core components; the
 * camera tours the wall on a spring, and each part does its one action as the camera arrives.
 * Every move is a spring at damping ratio ~0.75 (one small overshoot, then it settles).
 */
import * as React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  Avatar,
  AvatarGroup,
  Button,
  Card,
  Checkbox,
  Chip,
  Composer,
  ComposerInput,
  ComposerRow,
  ComposerSend,
  Flex,
  Heading,
  Progress,
  SegmentedControl,
  SegmentedItem,
  Slider,
  Stack,
  Switch,
  Tabs,
  TabsList,
  TabsTab,
  Text,
  TextField,
} from "@kushagradhawan/kookie-ui-react";
import { ArrowUpIcon, MailIcon, PaperclipIcon, StopSquareIcon } from "../../../docs/app/icons";
import { Members } from "./Act1";
import { HOVER, PRESS, World, follow, W, H, gx, gy, lerp, ramp, typed } from "./kit";

export const PARTS_FRAMES = 480;

const SPRING = { damping: 18, stiffness: 140, mass: 1 }; // ζ ≈ 0.76
const TW = 336;
const TH = 240;
const GAP = 48;
const WX = gx(1);
const WY = gy(1);
const tx = (c: number) => WX + c * (TW + GAP);
const ty = (r: number) => WY + r * (TH + GAP);
const WALL = { x: WX + (4 * TW + 3 * GAP) / 2, y: WY + (3 * TH + 2 * GAP) / 2 };

const APART = 15; // the screen comes apart on the first beat
const ROW_AT = [60, 180, 300]; // each row's tour starts on a beat
// Each part gets two beats: the camera arrives on the first and settles, the part acts on the second.
const slotAt = (i: number) => ROW_AT[Math.floor(i / 4)]! + 30 * (Math.floor(i / 4) % 2 === 0 ? i % 4 : 3 - (i % 4));
const actAt = (i: number) => slotAt(i) + 15;
const TOUR_END = 420;

const SEND_ICONS = { ready: <ArrowUpIcon />, submitted: <ArrowUpIcon />, streaming: <StopSquareIcon />, error: <ArrowUpIcon /> };

function Tile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Card size="3" style={{ width: TW, height: TH, boxSizing: "border-box" }}>
      <Stack gap="4" style={{ height: "100%" }}>
        <Text size="2" emphasis="medium">{label}</Text>
        <Flex direction="column" justify="center" style={{ flex: 1, minHeight: 0 }}>{children}</Flex>
      </Stack>
    </Card>
  );
}

function useParts(f: number, fps: number) {
  const sp = (at: number) => spring({ frame: f - at, fps, config: SPRING });
  const a = (i: number) => f - actAt(i);
  const on = (i: number, d = 0) => a(i) >= d;
  return [
    <Tile key="0" label="Button">
      <Flex gap="3">
        <Button emphasis="quiet" bordered>Cancel</Button>
        <Button emphasis="medium">Preview</Button>
        <span style={{ display: "inline-flex", scale: `${1 - 0.05 * (ramp(a(0), -1, 1) * (1 - ramp(a(0), 2, 7)))}` }}>
          <Button emphasis="loud" loading={on(0, 2) && !on(0, 22)} done={on(0, 22)} style={a(0) >= -6 && a(0) < 2 ? (a(0) >= -1 ? PRESS : HOVER) : undefined}>
            {on(0, 22) ? "Published" : "Publish"}
          </Button>
        </span>
      </Flex>
    </Tile>,
    <Tile key="1" label="Text field">
      <TextField size="3" leading={<MailIcon />} placeholder="Email" aria-label="Email" value={typed("hi@kookie.dev", f, actAt(1) - 4, 1)} onChange={() => {}} />
    </Tile>,
    <Tile key="2" label="Menu">
      <Card size="1" style={{ padding: 6, display: "flex", flexDirection: "column" }}>
        {["Rename", "Duplicate", "Move to folder", "Delete"].map((r, k) => (
          <Button key={r} emphasis="quiet" tone={k === 3 ? "destructive" : undefined} style={{ width: "100%", justifyContent: "flex-start", ...(k === Math.min(3, Math.max(0, Math.floor((a(2) + 12) / 4))) ? HOVER : {}) }}>
            {r}
          </Button>
        ))}
      </Card>
    </Tile>,
    <Tile key="3" label="Switch">
      <Stack gap="3">
        {["Mentions", "Replies", "Deploys"].map((r, k) => (
          <Flex key={r} justify="space-between" align="center">
            <Text weight="medium">{r}</Text>
            <Switch checked={k === 1 ? !on(3, k * 4) : on(3, k * 4)} aria-label={r} />
          </Flex>
        ))}
      </Stack>
    </Tile>,
    <Tile key="4" label="Slider">
      <Stack gap="3">
        <Flex justify="space-between"><Text weight="medium">Volume</Text><Text emphasis="medium" style={{ fontVariantNumeric: "tabular-nums" }}>{Math.round(lerp(20, 72, sp(actAt(4) - 4)))}</Text></Flex>
        <Slider value={lerp(20, 72, sp(actAt(4) - 4))} min={0} max={100} step={0.01} aria-label="Volume" />
      </Stack>
    </Tile>,
    <Tile key="5" label="Checkbox">
      <Stack gap="3">
        {["Design review", "Write the notes", "Ship it"].map((r, k) => (
          <Flex key={r} gap="3" align="center">
            <Checkbox checked={on(5, k * 4)} aria-label={r} />
            <Text>{r}</Text>
          </Flex>
        ))}
      </Stack>
    </Tile>,
    <Tile key="6" label="Tabs">
      <Tabs value={on(6, 6) ? "settings" : on(6, 0) ? "activity" : "overview"}>
        <TabsList>
          <TabsTab value="overview">Overview</TabsTab>
          <TabsTab value="activity">Activity</TabsTab>
          <TabsTab value="settings">Settings</TabsTab>
        </TabsList>
      </Tabs>
    </Tile>,
    <Tile key="7" label="Segmented control">
      <SegmentedControl value={on(7, 6) ? "month" : on(7, 0) ? "week" : "day"} aria-label="Range" style={{ width: "100%" }}>
        <SegmentedItem value="day">Day</SegmentedItem>
        <SegmentedItem value="week">Week</SegmentedItem>
        <SegmentedItem value="month">Month</SegmentedItem>
      </SegmentedControl>
    </Tile>,
    <Tile key="8" label="Dialog">
      <div style={{ translate: `0 ${(1 - sp(actAt(8) - 6)) * 40}px`, opacity: Math.min(1, sp(actAt(8) - 6) * 1.6) }}>
        <Card size="2">
          <Stack gap="3">
            <Heading size="4">Delete project?</Heading>
            <Flex gap="2" justify="flex-end">
              <Button emphasis="quiet" bordered>Cancel</Button>
              <Button emphasis="loud" tone="destructive">Delete</Button>
            </Flex>
          </Stack>
        </Card>
      </div>
    </Tile>,
    <Tile key="9" label="Progress">
      <Stack gap="3">
        <Flex justify="space-between" align="center">
          <Text weight="medium">Deploy</Text>
          {on(9, 14) ? <span style={{ display: "inline-flex", scale: `${sp(actAt(9) + 14)}` }}><Chip tone="info">Live</Chip></span> : <Text emphasis="medium">Building</Text>}
        </Flex>
        <Progress value={100 * ramp(a(9), -8, 14)} aria-label="Deploy" />
      </Stack>
    </Tile>,
    <Tile key="10" label="Composer">
      <Composer>
        <ComposerInput aria-label="Message" placeholder="Ask for a change" value={typed("Make the plan Pro", f, actAt(10) - 4, 1)} onChange={() => {}} />
        <ComposerRow>
          <Button iconOnly aria-label="Attach"><PaperclipIcon /></Button>
          <ComposerSend icons={SEND_ICONS} status="ready" />
        </ComposerRow>
      </Composer>
    </Tile>,
    <Tile key="11" label="Avatar">
      <Flex align="center" gap="4">
        <AvatarGroup size="4">
          <Avatar fallback="SB" />
          <Avatar fallback="SW" />
          <Avatar fallback="AR" />
          <span style={{ display: "inline-flex", scale: `${on(11, 0) ? sp(actAt(11)) : 0}` }}><Avatar fallback="K" /></span>
        </AvatarGroup>
        {on(11, 4) ? <span style={{ display: "inline-flex", scale: `${sp(actAt(11) + 4)}` }}><Chip tone="info">Joined</Chip></span> : null}
      </Flex>
    </Tile>,
  ];
}

export function Parts() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const parts = useParts(f, fps);

  // Camera target: the wall, then each part as it acts, then the wall again.
  const target = (t: number): [number, number, number] => {
    if (t < ROW_AT[0]!) return [WALL.x, WALL.y, 0.92];
    if (t >= TOUR_END) return [WALL.x, WALL.y, 0.86];
    let i = 0;
    let best = -Infinity;
    for (let k = 0; k < 12; k++) if (t >= slotAt(k) && slotAt(k) > best) { best = slotAt(k); i = k; }
    const c = i % 4;
    const r = Math.floor(i / 4);
    return [tx(c) + TW / 2, ty(r) + TH / 2, 2.1];
  };
  const cam = {
    x: follow(f, (t) => target(t)[0], 100, 18),
    y: follow(f, (t) => target(t)[1], 100, 18),
    s: Math.exp(follow(f, (t) => Math.log(target(t)[2]), 100, 18)),
  };

  const apart = spring({ frame: f - APART, fps, config: SPRING });
  const words = f >= TOUR_END + 7;
  const veil = ramp(f, TOUR_END + 3, TOUR_END + 11);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <World cam={cam} width={gx(40)} height={gy(20)}>
        {/* The screen that comes apart. */}
        <div style={{ position: "absolute", left: WALL.x - gx(9), top: WALL.y - 240, width: gx(18), opacity: 1 - ramp(f, APART, APART + 8), scale: `${1 - 0.25 * apart}` }}>
          <Members f={99999} />
        </div>
        {parts.map((node, i) => {
          const s = spring({ frame: f - APART - 2 - i * 1.5, fps, config: SPRING });
          const x = lerp(WALL.x - TW / 2, tx(i % 4), s);
          const y = lerp(WALL.y - TH / 2, ty(Math.floor(i / 4)), s);
          return (
            // Once landed, the tile drops its scale and opacity: a settled layer left composited was painted stale by the software GPU.
            <div key={i} style={Math.abs(1 - s) < 0.002 ? { position: "absolute", left: tx(i % 4), top: ty(Math.floor(i / 4)) } : { position: "absolute", left: x, top: y, scale: `${lerp(0.4, 1, s)}`, opacity: Math.min(1, s * 2) }}>
              {node}
            </div>
          );
        })}
      </World>
      {words ? (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: `color-mix(in oklab, var(--neutral-4) ${veil * 82}%, transparent)` }}>
          <Heading size="9" style={{ fontSize: 132, lineHeight: 1.02, letterSpacing: "-0.045em", textAlign: "center", whiteSpace: "nowrap" }}>
            {[[TOUR_END + 12, "Every part."], [TOUR_END + 30, "One system."]].map(([at, w]) =>
              f >= (at as number) ? (
                <span key={w as string} style={{ display: "block", scale: `${1.06 - 0.06 * ramp(f, at as number, (at as number) + 4)}` }}>{w}</span>
              ) : null,
            )}
          </Heading>
        </div>
      ) : null}
    </div>
  );
}

export { W, H };
