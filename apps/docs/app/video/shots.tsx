"use client";

/**
 * Stage for the Kookie UI launch film (2026-10-12). One shot per `?shot=` value at a fixed
 * 1920×1080 frame. Every surface is a real package component; the only things this file draws
 * itself are the construction lines (grid, guide circles, a drawn path), in the page's own
 * neutral tokens, because they are the film's language and not the system's. `video/capture.mjs`
 * drives these pages through their states by URL.
 */
import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Cancel01Icon,
  Home01Icon,
  Search01Icon,
  Settings02Icon,
  Notification01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Box,
  Checkbox,
  Chip,
  Kbd,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Spinner,
  Tabs,
  TabsList,
  TabsTab,
  Button,
  Card,
  Flex,
  Heading,
  iconStroke,
  SegmentedControl,
  SegmentedItem,
  Slider,
  Stack,
  Switch,
  Text,
  TextField,
  Theme,
  Composer,
  ComposerInput,
  ComposerRow,
  ComposerSend,
} from "@kushagradhawan/kookie-ui-react";
import { Conversation, Reply, Step, Steps, Turn, UserMessage } from "../../blocks/conversation";
import { ArrowDownIcon, ArrowUpIcon, ChartIcon, FolderIcon, HomeIcon, MoreIcon, PaperclipIcon, PlusIcon, SearchIcon, SettingsIcon, StopSquareIcon, UsersIcon } from "../icons";
import { Logo } from "../(docs)/logo";
import { DeployStatus, Notifications, PlanPicker, SignIn } from "../preview/showcase";

type Params = Record<string, string | undefined>;

/** CSS frame, rendered at deviceScaleFactor 4/3 to 1920×1080. No zoom on glass: the lens measures CSS px. */
export const W = 1440;
export const H = 810;
export const CELL = 48;
export const LINE = "var(--neutral-a6)";
export const GUIDE = "var(--neutral-a7)";
export const TICK = "var(--neutral-a8)";
/** Grid lines: x = 48k, y = 21 + 48k (the grid is centred on the frame). */
export const gx = (k: number) => k * CELL;
export const gy = (k: number) => 21 + k * CELL;
/** Zoom at which `n` native px fill one cell. */
export const cellZoom = (n: number) => CELL / n;

export const Icon = ({ icon }: { icon: Parameters<typeof HugeiconsIcon>[0]["icon"] }) => (
  <HugeiconsIcon icon={icon} strokeWidth={iconStroke} aria-hidden />
);

/** The ground: the page's neutral with a construction grid, Womp's own language. */
export function Ground({ children, grid = true }: { children: React.ReactNode; grid?: boolean }) {
  return (
    <div
      style={{
        position: "relative",
        width: W,
        height: H,
        overflow: "hidden",
        isolation: "isolate",
        background: "var(--neutral-4)",
        backgroundImage: grid
          ? `linear-gradient(to right, ${LINE} 1px, transparent 1px), linear-gradient(to bottom, ${LINE} 1px, transparent 1px)`
          : undefined,
        backgroundSize: `${CELL}px ${CELL}px`,
        backgroundPosition: `${(W / 2) % CELL}px ${(H / 2) % CELL}px`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Snap marks, measured from the rendered layout: every element marked `data-snap` gets four
 * corner ticks on its real box, the way a 3D tool marks a selection. Every layout in the film
 * sits on whole grid cells, so the ticks land on grid intersections; nothing is placed by hand.
 */
export function Ticks({ root }: { root: React.RefObject<HTMLElement | null> }) {
  const [boxes, setBoxes] = React.useState<{ x: number; y: number; w: number; h: number }[]>([]);
  React.useLayoutEffect(() => {
    const measure = () => {
      const base = root.current?.getBoundingClientRect();
      if (!base) return;
      setBoxes(
        [...root.current!.querySelectorAll<HTMLElement>("[data-snap]")].map((el) => {
          const b = el.getBoundingClientRect();
          return { x: b.left - base.left, y: b.top - base.top, w: b.width, h: b.height };
        }),
      );
    };
    measure();
    document.fonts?.ready.then(measure);
    const t = setTimeout(measure, 400);
    return () => clearTimeout(t);
  }, [root]);
  const T = 5;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }} fill="none">
      {boxes.map(({ x, y, w, h }, i) => (
        <path
          key={i}
          stroke={TICK}
          strokeWidth={1.1}
          d={[
            `M ${x - T} ${y} H ${x + T} M ${x} ${y - T} V ${y + T}`,
            `M ${x + w - T} ${y} H ${x + w + T} M ${x + w} ${y - T} V ${y + T}`,
            `M ${x - T} ${y + h} H ${x + T} M ${x} ${y + h - T} V ${y + h + T}`,
            `M ${x + w - T} ${y + h} H ${x + w + T} M ${x + w} ${y + h - T} V ${y + h + T}`,
          ].join(" ")}
        />
      ))}
    </svg>
  );
}

/** How far a caption has arrived, 0..1. The film drives it per frame; the stills page leaves it at 1. */
export const CaptionIn = React.createContext(1);

export function Caption({ children, align = "start" }: { children: React.ReactNode; align?: "start" | "center" | undefined }) {
  return (
    <Heading
      size="9"
      style={{
        opacity: React.useContext(CaptionIn),
        translate: `0 ${(1 - React.useContext(CaptionIn)) * 16}px`,
        position: "absolute",
        left: align === "center" ? 0 : 96,
        right: align === "center" ? 0 : undefined,
        top: 84,
        textAlign: align,
        fontSize: 48,
        lineHeight: 1.05,
        letterSpacing: "-0.02em",
      }}
    >
      {children}
    </Heading>
  );
}

export function Stage({ children, caption, captionAlign }: { children: React.ReactNode; caption?: React.ReactNode; captionAlign?: "start" | "center" }) {
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <Ground>
      <div ref={ref} style={{ position: "absolute", inset: 0 }}>
        <Ticks root={ref} />
        {caption ? <Caption align={captionAlign}>{caption}</Caption> : null}
        {children}
      </div>
    </Ground>
  );
}

export const at = (x: number, y: number): React.CSSProperties => ({ position: "absolute", left: x, top: y });

/* ── 1. Open ─────────────────────────────────────────────────────────────────────────── */

export function Open({ t = 1 }: { t?: number }) {
  return (
    <Stage>
      <Flex direction="column" align="center" justify="center" gap="6" style={{ position: "absolute", inset: 0, opacity: t, scale: `${0.96 + 0.04 * t}` }}>
        <Box style={{ fontSize: 84 }}>
          <Logo height="1em" />
        </Box>
        <Heading size="9" style={{ fontSize: 66, lineHeight: 1, letterSpacing: "-0.03em" }}>
          Kookie UI
        </Heading>
      </Flex>
    </Stage>
  );
}

/* ── 2. The system ───────────────────────────────────────────────────────────────────── */

/**
 * Every control at size 4 is 48px tall, so each one is exactly one grid cell.
 * Widths are whole cells too (k × 48 native), so every box starts and ends on a grid line.
 */
export const Z4 = cellZoom(48);
export const cells = (k: number) => k * 48;

export function Snap({ x, y, w, children }: { x: number; y: number; w?: number; children: React.ReactNode }) {
  return (
    <div style={at(gx(x), gy(y))}>
      <div style={{ zoom: Z4 }}>
        <div data-snap style={{ width: w ? cells(w) : undefined, height: 48, display: "flex", alignItems: "center" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function System({ material }: { material: string }) {
  return (
    <Stage caption="Kookie UI is a design system for React.">
      <Theme material={material as never} style={{ position: "absolute", inset: 0 }}>
        <Box backdrop style={{ position: "absolute", inset: 0 }}>
          {/* Row 1: field, close, switch. Row 2: view, add, volume. Row 3: the three actions. */}
          <Snap x={7} y={6} w={12}>
            <TextField size="4" placeholder="Search" leading={<Icon icon={Search01Icon} />} style={{ width: "100%" }} />
          </Snap>
          <Snap x={20} y={6} w={1}>
            <Button size="4" iconOnly aria-label="Close">
              <Icon icon={Cancel01Icon} />
            </Button>
          </Snap>
          <Snap x={22} y={6} w={1}>
            <Switch size="4" defaultChecked aria-label="Wi-Fi" />
          </Snap>
          <Snap x={7} y={8} w={7}>
            <SegmentedControl size="4" defaultValue="grid" aria-label="View" style={{ width: "100%" }}>
              <SegmentedItem value="list">List</SegmentedItem>
              <SegmentedItem value="grid">Grid</SegmentedItem>
              <SegmentedItem value="board">Board</SegmentedItem>
            </SegmentedControl>
          </Snap>
          <Snap x={15} y={8} w={1}>
            <Button size="4" iconOnly emphasis="loud" aria-label="Add">
              <Icon icon={Add01Icon} />
            </Button>
          </Snap>
          <Snap x={17} y={8} w={6}>
            <Slider size="4" defaultValue={62} aria-label="Volume" style={{ width: "100%" }} />
          </Snap>
          <Snap x={7} y={10} w={4}>
            <Button size="4" style={{ width: "100%" }}>Cancel</Button>
          </Snap>
          <Snap x={13} y={10} w={4}>
            <Button size="4" emphasis="loud" style={{ width: "100%" }}>Continue</Button>
          </Snap>
          <Snap x={19} y={10} w={4}>
            <Button size="4" tone="destructive" emphasis="loud" style={{ width: "100%" }}>Delete</Button>
          </Snap>
        </Box>
      </Theme>
    </Stage>
  );
}

/* ── 3. Constraints: tone × emphasis ─────────────────────────────────────────────────── */

export const TONES = ["neutral", "destructive", "info"] as const;
export const RUNGS = ["quiet", "medium", "loud"] as const;

export function Rules() {
  // Size 2 is 32px, so at zoom 1.5 a button is one cell. Each button is three cells wide.
  const Z = cellZoom(32);
  const mono: React.CSSProperties = { fontFamily: "var(--font-mono)", fontSize: 15 };
  return (
    <Stage caption={<>Tone shows what a control does.<br />Emphasis shows how important it is.</>}>
      {RUNGS.map((r, c) => (
        <Text key={r} emphasis="quiet" style={{ ...mono, ...at(gx(12 + c * 4), gy(5)), width: gx(3), height: CELL, display: "grid", placeItems: "center" }}>
          {r}
        </Text>
      ))}
      {TONES.map((t, row) => (
        <React.Fragment key={t}>
          <Text emphasis="quiet" style={{ ...mono, ...at(gx(7), gy(6 + row * 2)), width: gx(4) - 18, height: CELL, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
            {t}
          </Text>
          {RUNGS.map((r, c) => (
            <div key={r} style={at(gx(12 + c * 4), gy(6 + row * 2))}>
              <div data-snap style={{ zoom: Z, width: 96, height: 32 }}>
                <Button size="2" tone={t} emphasis={r} style={{ width: "100%" }}>
                  {t === "destructive" ? "Delete" : t === "info" ? "Share" : "Save"}
                </Button>
              </div>
            </div>
          ))}
        </React.Fragment>
      ))}
    </Stage>
  );
}

/* ── 4. Constraints: size is an index ───────────────────────────────────────────────── */

export function useHeight(ref: React.RefObject<HTMLElement | null>) {
  const [h, setH] = React.useState<number | null>(null);
  React.useLayoutEffect(() => {
    const m = () => {
      const b = ref.current?.querySelector("button")?.getBoundingClientRect();
      if (b) setH(b.height);
    };
    m();
    document.fonts?.ready.then(m);
  }, [ref]);
  return h;
}

export function Rung({ size, col }: { size: "1" | "2" | "3" | "4"; col: number }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const h = useHeight(ref);
  const Z = Z4;
  return (
    <>
      <div
        ref={ref}
        style={{ position: "absolute", left: gx(col), width: gx(4), bottom: H - gy(10), display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 10 }}
      >
        <div style={{ zoom: Z }}>
          <Button size={size} emphasis="loud">
            Continue
          </Button>
        </div>
        {h ? (
          <div style={{ position: "relative", height: h, borderBlock: `1.1px solid ${TICK}`, width: 9 }}>
            <div style={{ position: "absolute", left: 4, top: 0, bottom: 0, borderLeft: `1.1px solid ${TICK}` }} />
          </div>
        ) : null}
      </div>
      <Text
        weight="medium"
        style={{ ...at(gx(col), gy(10) + 18), width: gx(4), textAlign: "center", fontSize: 15, fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}
      >
        size="{size}" · {h ? Math.round(h / Z) : ""}px
      </Text>
    </>
  );
}

export function Sizes() {
  return (
    <Stage caption={<>Size is an index.<br />The theme sets the height.</>}>
      {(["1", "2", "3", "4"] as const).map((s, i) => (
        <Rung key={s} size={s} col={7 + i * 4} />
      ))}
    </Stage>
  );
}

/* ── 5. Glass over the grid ────────────────────────────────────────────────────────── */

/**
 * No drawing: the glass sits on the grid itself, so the only lines it can bend are the
 * construction lines every other shot stands on. Size 4 controls are one cell tall with no zoom
 * (the lens measures CSS px, so glass is never zoomed); the column is six cells wide.
 */
export function Glass({ material, x = 12, ticks = true }: { material: string; x?: number; ticks?: boolean }) {
  const Z = 1;
  const Box2 = ({ x, y, w, h, children }: { x: number; y: number; w: number; h: number; children: React.ReactNode }) => (
    <div style={at(gx(x), gy(y))}>
      <div data-snap style={{ zoom: Z, width: (w * CELL) / Z, height: (h * CELL) / Z }}>
        {children}
      </div>
    </div>
  );
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <Ground>
      <div ref={ref} style={{ position: "absolute", inset: 0 }}>
        {ticks ? <Ticks root={ref} /> : null}
        <Caption>Glass bends light at its edge.<br />Use it only where content moves behind it.</Caption>
        <Theme material={material as never} style={{ position: "absolute", inset: 0 }}>
          <Box backdrop style={{ position: "absolute", inset: 0 }}>
            <Box2 x={x} y={5} w={6} h={1}>
              <TextField size="4" defaultValue="Design" leading={<Icon icon={Search01Icon} />} style={{ width: "100%" }} />
            </Box2>
            <Box2 x={x} y={7} w={6} h={3}>
              <Card size="2" style={{ height: "100%" }}>
                <Flex direction="column" justify="space-between" style={{ height: "100%" }}>
                  <Text size="3" weight="medium">
                    Wi-Fi
                  </Text>
                  <Flex justify="space-between" align="center">
                    <Text size="3" emphasis="medium">
                      Studio
                    </Text>
                    <Switch size="2" defaultChecked aria-label="Wi-Fi" />
                  </Flex>
                </Flex>
              </Card>
            </Box2>
            <Box2 x={x} y={11} w={6} h={1}>
              <SegmentedControl size="4" defaultValue="home" aria-label="Section" style={{ width: "100%" }}>
                <SegmentedItem value="home">Home</SegmentedItem>
                <SegmentedItem value="people">People</SegmentedItem>
                <SegmentedItem value="alerts">Alerts</SegmentedItem>
              </SegmentedControl>
            </Box2>
          </Box>
        </Theme>
      </div>
    </Ground>
  );
}

/* ── 6. A pill pads wider ───────────────────────────────────────────────────────────── */

export function useInset(ref: React.RefObject<HTMLElement | null>, zoom: number) {
  const [inset, setInset] = React.useState<number | null>(null);
  React.useLayoutEffect(() => {
    const measure = () => {
      const el = ref.current?.querySelector("button");
      if (!el) return;
      const text = document.createTreeWalker(el, NodeFilter.SHOW_TEXT).nextNode();
      if (!text) return;
      const range = document.createRange();
      range.selectNodeContents(text);
      setInset((range.getBoundingClientRect().left - el.getBoundingClientRect().left) / zoom);
    };
    measure();
    document.fonts?.ready.then(measure);
  }, [ref, zoom]);
  return inset;
}

export function PillSpecimen({ radius }: { radius: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const ZOOM = 3;
  const inset = useInset(ref, ZOOM);
  return (
    <Stack gap="6" align="center">
      <div ref={ref} style={{ zoom: ZOOM, position: "relative" }}>
        <Theme radius={radius as never}>
          <Button size="2" emphasis="loud">
            Continue
          </Button>
        </Theme>
        {inset ? (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: -8,
              bottom: -8,
              width: inset,
              borderInline: `0.3px solid var(--neutral-9)`,
              background: "var(--neutral-a3)",
              pointerEvents: "none",
            }}
          />
        ) : null}
      </div>
      <Text size="6" weight="medium" style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>
        {inset ? `${Math.round(inset)}px` : ""}
      </Text>
    </Stack>
  );
}

export function Pill() {
  return (
    <Stage caption={<>A round button has<br />more space at each side.</>}>
      <Flex align="center" justify="center" style={{ position: "absolute", inset: 0, paddingTop: 90, columnGap: 165 }}>
        <PillSpecimen radius="medium" />
        <PillSpecimen radius="full" />
      </Flex>
    </Stage>
  );
}

/* ── 7. Desktop becomes a phone ─────────────────────────────────────────────────────── */

export const PEOPLE = [
  ["Shruti Bhatia", "Owner"],
  ["Sol Whitaker", "Admin"],
  ["Ada Rowe", "Member"],
  ["Ines Okafor", "Member"],
] as const;

export const NAV = [
  [Home01Icon, "Overview"],
  [UserGroupIcon, "Members"],
  [Notification01Icon, "Alerts"],
  [Settings02Icon, "Settings"],
] as const;

export function App({ side }: { side: number }) {
  return (
    <Flex style={{ height: "100%" }}>
      {side <= 0 ? null : (
        <Stack gap="1" p="4" style={{ width: 220 * side, opacity: side, overflow: "hidden", flexShrink: 0, borderInlineEnd: "1px solid var(--neutral-a4)" }}>
          {NAV.map(([icon, label], i) => (
            <Button key={label} emphasis={i === 1 ? "medium" : "quiet"} leading={<Icon icon={icon} />} style={{ justifyContent: "flex-start" }}>
              {label}
            </Button>
          ))}
        </Stack>
      )}
      <Stack gap="5" p="6" style={{ flex: 1, minWidth: 0 }}>
        <Flex justify="space-between" align="center">
          <Heading size="6">Members</Heading>
          <Box data-measure>
            <Button emphasis="loud">Invite</Button>
          </Box>
        </Flex>
        <TextField placeholder="Search members" leading={<Icon icon={Search01Icon} />} />
        <Stack gap="4">
          {PEOPLE.map(([name, role]) => (
            <Flex key={name} align="center" gap="3">
              <Avatar size="2" fallback={name[0]} />
              <Stack gap="0" style={{ flex: 1 }}>
                <Text size="3">{name}</Text>
                <Text size="2" emphasis="medium">
                  {role}
                </Text>
              </Stack>
              <Switch defaultChecked={name !== "Ada Rowe"} aria-label={`Notify ${name}`} />
            </Flex>
          ))}
        </Stack>
      </Stack>
    </Flex>
  );
}

/** Desktop becomes a phone. `p` 0..1: the frame narrows from 20 to 8 cells around its centre, the
    sidebar folds away, the corner rounds, and at the end the pointer turns coarse so the controls grow. */
export function DeviceMorph({ p }: { p: number }) {
  const w = 20 - 12 * p;
  const side = Math.max(0, 1 - p * 1.6);
  const coarse = p >= 0.999;
  return (
    <Stage caption={p < 0.5 ? <>You make the interface one time.</> : <>On a touch screen,<br />the controls are larger.</>}>
      <div style={at(gx(15 - w / 2), gy(5))}>
        <Theme pointer={coarse ? "coarse" : "fine"}>
          <Card
            {...(p === 0 || coarse ? { "data-snap": true } : {})}
            size="1"
            style={{ width: w * CELL, height: 10 * CELL, padding: 0, borderRadius: 16 + 24 * p, overflow: "hidden" }}
          >
            <App side={side} />
          </Card>
        </Theme>
      </div>
    </Stage>
  );
}

export function Device({ mode }: { mode: "desktop" | "phone" }) {
  return <DeviceMorph p={mode === "phone" ? 1 : 0} />;
}

/* ── Shared: a measured label in the film's mono voice ─────────────────────────────── */

export const MONO: React.CSSProperties = { fontFamily: "var(--font-mono)", fontSize: 15, fontVariantNumeric: "tabular-nums" };

export function Label({ x, y, w, children, align = "center", quiet }: { x: number; y: number; w: number; children: React.ReactNode; align?: "center" | "start" | "end"; quiet?: boolean }) {
  return (
    <Text
      {...(quiet ? { emphasis: "quiet" as const } : { weight: "medium" as const })}
      style={{ ...MONO, ...at(gx(x), gy(y)), width: gx(w), height: CELL, display: "flex", alignItems: "center", justifyContent: align === "center" ? "center" : align === "start" ? "flex-start" : "flex-end" }}
    >
      {children}
    </Text>
  );
}

/* ── 1. The idea: intent in, result out ─────────────────────────────────────────────── */

export function Idea({ step }: { step: number }) {
  return (
    <Stage caption={step === 0 ? <>You give the intent.</> : <>You give the intent.<br />Kookie UI makes the result.</>}>
      <div data-snap style={{ ...at(gx(5), gy(7)), width: gx(11), height: gx(3), display: "flex", alignItems: "center" }}>
        <Text style={{ fontFamily: "var(--font-mono)", fontSize: 20, lineHeight: 1.6 }}>
          {"<Button"}
          <br />
          {"  tone=\"info\""}
          <br />
          {"  emphasis=\"loud\""}
          <br />
          {"  size=\"4\">Share</Button>"}
        </Text>
      </div>
      {step > 0 ? (
        <Snap x={19} y={8} w={5}>
          <Button size="4" tone="info" emphasis="loud" style={{ width: "100%" }}>
            Share
          </Button>
        </Snap>
      ) : null}
    </Stage>
  );
}

/** The same call site under three Theme values: the code did not change, the result did. */
export function ThemeFlip() {
  const cols: [string, React.ComponentProps<typeof Theme>][] = [
    ['radius="full"', { radius: "full" }],
    ['radius="none"', { radius: "none" }],
    ['appearance="dark"', { appearance: "dark" }],
  ];
  return (
    <Stage caption={<>Change one Theme value.<br />Every result changes with it.</>}>
      {cols.map(([label, props], i) => (
        <React.Fragment key={label}>
          <div style={{ ...at(gx(4 + i * 8), gy(6)), width: gx(6), height: gx(4) }}>
            <Theme {...props} style={{ height: "100%" }}>
              <Card data-snap size="2" style={{ height: "100%", boxSizing: "border-box" }}>
                <Stack gap="4" justify="center" style={{ height: "100%" }}>
                  <Text size="3" weight="medium">Share this file</Text>
                  <Flex gap="2">
                    <Button size="2">Cancel</Button>
                    <Button size="2" tone="info" emphasis="loud">Share</Button>
                  </Flex>
                </Stack>
              </Card>
            </Theme>
          </div>
          <Label x={4 + i * 8} y={10} w={6}>{label}</Label>
        </React.Fragment>
      ))}
    </Stage>
  );
}

/* ── 2. Foundations ─────────────────────────────────────────────────────────────────── */

export const RAMPS = ["neutral", "blue", "orange", "amber", "destructive"] as const;

export function Colour() {
  const steps = Array.from({ length: 12 }, (_, i) => i + 1);
  const ramp = (mode: "light" | "dark", x: number) => (
    <div style={{ ...at(gx(x), gy(6)), width: gx(12), height: gx(RAMPS.length) }}>
      <Theme appearance={mode} style={{ height: "100%", background: "transparent" }}>
        <div data-snap style={{ display: "grid", gridTemplateColumns: `repeat(12, ${CELL}px)`, gridAutoRows: CELL }}>
          {RAMPS.flatMap((t) => steps.map((n) => <div key={`${t}${n}`} style={{ background: `var(--${t}-${n})` }} />))}
        </div>
      </Theme>
    </div>
  );
  return (
    <Stage caption={<>One configuration makes every colour,<br />in light and in dark.</>}>
      <Label x={3} y={5} w={12} quiet>light</Label>
      <Label x={15} y={5} w={12} quiet>dark</Label>
      {RAMPS.map((t, i) => (
        <Label key={t} x={0} y={6 + i} w={3} align="end" quiet>{t}&nbsp;&nbsp;</Label>
      ))}
      {ramp("light", 3)}
      {ramp("dark", 15)}
    </Stage>
  );
}

export function TypeScale() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [px, setPx] = React.useState<number[]>([]);
  React.useLayoutEffect(() => {
    const m = () => setPx([...(ref.current?.querySelectorAll<HTMLElement>("[data-step]") ?? [])].map((e) => parseFloat(getComputedStyle(e).fontSize)));
    m();
    document.fonts?.ready.then(m);
  }, []);
  const STEPS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;
  return (
    <Stage caption={<>All text comes from one scale.</>}>
      <div ref={ref} style={{ position: "absolute", left: gx(3), width: gx(24), bottom: H - gy(10), display: "grid", gridTemplateColumns: "repeat(9, 1fr)", alignItems: "baseline" }}>
        {STEPS.map((s) => (
          <Text key={s} data-step size={s} weight="medium" style={{ textAlign: "center", lineHeight: 1 }}>
            Aa
          </Text>
        ))}
      </div>
      <div style={{ position: "absolute", left: gx(3), width: gx(24), top: gy(10), height: 1, background: TICK }} />
      <div style={{ ...at(gx(3), gy(10) + 12), width: gx(24), display: "grid", gridTemplateColumns: "repeat(9, 1fr)" }}>
        {STEPS.map((s, i) => (
          <Text key={s} weight="medium" style={{ ...MONO, textAlign: "center" }}>
            {s}
            <br />
            <span style={{ opacity: 0.6 }}>{px[i] ? `${px[i]}px` : ""}</span>
          </Text>
        ))}
      </div>
    </Stage>
  );
}

export function GapColumn({ gap, x }: { gap: "2" | "4" | "6"; x: number }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [g, setG] = React.useState<number | null>(null);
  React.useLayoutEffect(() => {
    const m = () => {
      const b = ref.current?.querySelectorAll("button");
      if (b && b.length > 1) setG(b[1]!.getBoundingClientRect().top - b[0]!.getBoundingClientRect().bottom);
    };
    m();
    document.fonts?.ready.then(m);
  }, []);
  return (
    <>
      <div ref={ref} style={{ ...at(gx(x), gy(5)), width: gx(5) }}>
        <Stack gap={gap}>
          {["Draft", "Review", "Publish"].map((l) => (
            <div key={l} data-snap>
              <Button size="4" emphasis="medium" style={{ width: "100%" }}>{l}</Button>
            </div>
          ))}
        </Stack>
      </div>
      <Label x={x} y={11} w={5}>gap="{gap}" · {g != null ? Math.round(g) : ""}px</Label>
    </>
  );
}

export function Space() {
  return (
    <Stage caption={<>A component does not set the space around it.<br />The layout sets it.</>}>
      <GapColumn gap="2" x={4} />
      <GapColumn gap="4" x={12} />
      <GapColumn gap="6" x={20} />
    </Stage>
  );
}

export const LEVELS = ["none", "small", "medium", "large", "full"] as const;

export function Shape() {
  return (
    <Stage caption={<>Corners follow one rule.</>}>
      {LEVELS.map((r, i) => (
        <React.Fragment key={r}>
          <div style={{ ...at(gx(2 + i * 5.5) , gy(5)), width: gx(4) }}>
            <Theme radius={r}>
              <Stack gap="0">
                <div data-snap style={{ height: CELL * 3 }}>
                  <Card size="2" style={{ height: "100%", boxSizing: "border-box" }}>
                    <Stack gap="3">
                      <Text size="2" weight="medium">Studio</Text>
                      <Button size="2" emphasis="loud" style={{ width: "100%" }}>Join</Button>
                    </Stack>
                  </Card>
                </div>
              </Stack>
            </Theme>
          </div>
        </React.Fragment>
      ))}
    </Stage>
  );
}

export const THICK = ["solid", "thin", "regular", "thick"] as const;

export function Material() {
  return (
    <Stage caption={<>Glass is a material. You choose<br />how much of the background shows through.</>}>
      {THICK.map((m, i) => (
        <React.Fragment key={m}>
          <div style={{ ...at(gx(3 + i * 6.5), gy(6)), width: gx(5), height: gx(3) }}>
            <Theme material={m} style={{ height: "100%" }}>
              <Card data-snap size="2" backdrop style={{ height: "100%", boxSizing: "border-box" }}>
                <Flex direction="column" justify="space-between" style={{ height: "100%" }}>
                  <Text size="3" weight="medium">Wi-Fi</Text>
                  <Flex justify="space-between" align="center">
                    <Text size="2" emphasis="medium">Studio</Text>
                    <Switch size="2" defaultChecked aria-label="Wi-Fi" />
                  </Flex>
                </Flex>
              </Card>
            </Theme>
          </div>
          <Label x={3 + i * 6.5} y={9} w={5} quiet>{m[0]!.toUpperCase() + m.slice(1)}</Label>
        </React.Fragment>
      ))}
    </Stage>
  );
}

/* ── 3. Adaptivity ──────────────────────────────────────────────────────────────────── */

export function Mini() {
  return (
    <Stack gap="3">
      <Flex justify="space-between" align="center">
        <Text size="3" weight="medium">Members</Text>
        <Button size="2" emphasis="loud">Invite</Button>
      </Flex>
      {PEOPLE.slice(0, 3).map(([name, role]) => (
        <Flex key={name} align="center" gap="2">
          <Avatar size="2" fallback={name[0]} />
          <Stack gap="0" style={{ flex: 1, minWidth: 0 }}>
            <Text size="2">{name}</Text>
            <Text size="1" emphasis="medium">{role}</Text>
          </Stack>
          <Switch size="1" defaultChecked={name !== "Ada Rowe"} aria-label={`Notify ${name}`} />
        </Flex>
      ))}
    </Stack>
  );
}

export function Adapt() {
  const cols: [string, React.ComponentProps<typeof Theme>][] = [
    ['appearance="light"', { appearance: "light" }],
    ['appearance="dark"', { appearance: "dark" }],
    ['contrast="high"', { contrast: "high" }],
    ['density="compact"', { density: "compact" }],
  ];
  return (
    <Stage caption={<>You make the interface one time.<br />It adapts to each setting.</>}>
      {cols.map(([label, props], i) => (
        <React.Fragment key={label}>
          <div style={{ ...at(gx(2 + i * 7), gy(5)), width: gx(5) + CELL }}>
            <Theme {...props} style={{ background: "transparent" }}>
              <Card data-snap size="2">
                <Mini />
              </Card>
            </Theme>
          </div>
          <Label x={2 + i * 7} y={10} w={6}>{label}</Label>
        </React.Fragment>
      ))}
    </Stage>
  );
}

/* ── 4. Components ─────────────────────────────────────────────────────────────────── */

export function Parts() {
  return (
    <Stage caption={<>63 components.<br />One set of rules.</>}>
      <Snap x={3} y={5} w={8}>
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTab value="a">Overview</TabsTab>
            <TabsTab value="b">Activity</TabsTab>
            <TabsTab value="c">Settings</TabsTab>
          </TabsList>
        </Tabs>
      </Snap>
      <Snap x={12} y={5} w={6}>
        <Select size="4" defaultValue="gb" items={{ gb: "Gigabytes", tb: "Terabytes" }}>
          <SelectTrigger aria-label="Unit" style={{ width: "100%" }} />
          <SelectContent>
            <SelectItem value="gb">Gigabytes</SelectItem>
            <SelectItem value="tb">Terabytes</SelectItem>
          </SelectContent>
        </Select>
      </Snap>
      <Snap x={19} y={5} w={4}>
        <AvatarGroup size="4">
          <Avatar fallback="S" />
          <Avatar fallback="A" />
          <Avatar fallback="I" />
        </AvatarGroup>
      </Snap>
      <Snap x={24} y={5} w={3}>
        <Flex gap="2" align="center"><Kbd>⌘</Kbd><Kbd>K</Kbd></Flex>
      </Snap>
      <Snap x={3} y={7} w={8}>
        <Slider size="4" defaultValue={40} aria-label="Level" style={{ width: "100%" }} />
      </Snap>
      <Snap x={12} y={7} w={6}>
        <Progress value={64} aria-label="Upload" style={{ width: "100%" }} />
      </Snap>
      <Snap x={19} y={7} w={1}>
        <Checkbox size="4" defaultChecked aria-label="Done" />
      </Snap>
      <Snap x={21} y={7} w={1}>
        <Switch size="4" defaultChecked aria-label="On" />
      </Snap>
      <Snap x={23} y={7} w={1}>
        <Spinner />
      </Snap>
      <Snap x={25} y={7} w={2}>
        <Flex gap="2" align="center"><Text size="3">Inbox</Text><Badge tone="info">3</Badge></Flex>
      </Snap>
      <Snap x={3} y={9} w={8}>
        <TextField size="4" placeholder="Search" leading={<Icon icon={Search01Icon} />} style={{ width: "100%" }} />
      </Snap>
      <Snap x={12} y={9} w={6}>
        <Flex gap="2"><Chip tone="info">Running</Chip><Chip tone="destructive">Failed</Chip><Chip>Draft</Chip></Flex>
      </Snap>
      <Snap x={19} y={9} w={8}>
        <SegmentedControl size="4" defaultValue="d" aria-label="Range" style={{ width: "100%" }}>
          <SegmentedItem value="d">Day</SegmentedItem>
          <SegmentedItem value="w">Week</SegmentedItem>
          <SegmentedItem value="m">Month</SegmentedItem>
        </SegmentedControl>
      </Snap>
    </Stage>
  );
}

/* ── 5. Principles ─────────────────────────────────────────────────────────────────── */

export function Principles() {
  const lines = [
    ["There is no variant prop.", "tone + emphasis"],
    ["Every value comes from a token.", "var(--control-height-2)"],
    ["A component does not set its outer space.", "<Box m>"],
    ["A state change needs no JavaScript.", "[data-pressed]"],
  ] as const;
  return (
    <Stage caption={<>The rules.</>}>
      {lines.map(([rule, code], i) => (
        <React.Fragment key={rule}>
          <Text weight="medium" style={{ ...at(gx(3), gy(5 + i * 2)), height: CELL, display: "flex", alignItems: "center", fontSize: 32, letterSpacing: "-0.015em" }}>
            {rule}
          </Text>
          <Label x={19} y={5 + i * 2} w={8} align="end" quiet>{code}</Label>
          <div style={{ ...at(gx(3), gy(6 + i * 2)), width: gx(24), height: 1, background: GUIDE }} />
        </React.Fragment>
      ))}
    </Stage>
  );
}


/* ── v4: visual-first cut ─────────────────────────────────────────────────────────── */

export const gridBg = (cell: number, line = LINE): React.CSSProperties => ({
  backgroundImage: `linear-gradient(to right, ${line} 1px, transparent 1px), linear-gradient(to bottom, ${line} 1px, transparent 1px)`,
  backgroundSize: `${cell}px ${cell}px`,
});

export const PEOPLE_ROWS = [
  ["SB", "Shruti Bhatia", "shruti@kookie.dev", "Owner", null],
  ["SW", "Sol Whitaker", "sol@kookie.dev", "Admin", null],
  ["AR", "Ada Rowe", "ada@kookie.dev", "Member", null],
  ["MO", "Mei Ono", "mei@kookie.dev", "Member", null],
  ["KN", "Kit Nakamura", "kit@kookie.dev", "Member", "Invited"],
] as const;
export const NAV_ROWS = [
  ["Overview", <HomeIcon key="i" />],
  ["Projects", <FolderIcon key="i" />],
  ["Members", <UsersIcon key="i" />],
  ["Usage", <ChartIcon key="i" />],
  ["Settings", <SettingsIcon key="i" />],
] as const;

/** A workspace's members page: nav beside a titled list. Video-owned so every word and state agrees. */
export function MembersScreen({ height }: { height: number }) {
  return (
    <Card size="4" style={{ blockSize: height }}>
      <div style={{ display: "grid", gridTemplateColumns: "12rem minmax(0, 1fr)", columnGap: "var(--layout-space-7)", height: "100%" }}>
        <Stack gap="1" render={<nav aria-label="Workspace" />}>
          {NAV_ROWS.map(([label, icon]) => (
            <Button key={label} emphasis={label === "Members" ? "medium" : "quiet"} leading={icon} style={{ justifyContent: "flex-start" }}>
              {label}
            </Button>
          ))}
        </Stack>
        <Stack gap="5" minWidth="0">
          <Flex justify="space-between" align="center" gap="4">
            <Stack gap="1">
              <Heading size="6">Members</Heading>
              <Text emphasis="medium">12 people · 8 seats left</Text>
            </Stack>
            <Flex gap="3" align="center">
              <TextField placeholder="Search" leading={<SearchIcon />} aria-label="Search members" style={{ width: "12rem" }} />
              <Button emphasis="loud" leading={<PlusIcon />}>Invite</Button>
            </Flex>
          </Flex>
          <Box>
            {PEOPLE_ROWS.map(([initials, name, email, role, chip], i) => (
              <Box key={name} py="3" style={i ? { borderTop: "var(--border-width) solid var(--color-border)" } : undefined}>
                <Flex align="center" gap="4">
                  <Avatar size="3" fallback={initials} />
                  <Stack gap="1" flexGrow="1" minWidth="0">
                    <Text weight="medium">{name}</Text>
                    <Text size="2" emphasis="medium">{email}</Text>
                  </Stack>
                  {chip ? <Chip tone="info">{chip}</Chip> : null}
                  <Text size="2" emphasis="medium" style={{ width: "4.5rem", textAlign: "end" }}>{role}</Text>
                  <Button emphasis="quiet" iconOnly aria-label={`Actions for ${name}`}><MoreIcon /></Button>
                </Flex>
              </Box>
            ))}
          </Box>
        </Stack>
      </div>
    </Card>
  );
}

export const SEND_ICONS = { ready: <ArrowUpIcon />, submitted: <ArrowUpIcon />, streaming: <StopSquareIcon />, error: <ArrowUpIcon /> };
export const MODELS = { opus: "Opus 5", sonnet: "Sonnet 5" };

/** A real chat: the docs' Conversation block over the package Composer, one card. */
export function ChatScreen({ height }: { height: number }) {
  return (
    <Card size="3" render={<Stack gap="4" />} style={{ blockSize: height }}>
      <Conversation aria-label="Conversation" jumpLabel="Jump to the latest" jumpIcon={<ArrowDownIcon />}>
        <Turn id="u1" from="person">
          <UserMessage>Draft a note on the menu rows</UserMessage>
        </Turn>
        <Turn id="a1" from="agent">
          <Stack gap="5">
            <Steps summary="3 steps">
              <Step>Read the changelog</Step>
              <Step>Compared the two row families</Step>
              <Step>Wrote a draft</Step>
            </Steps>
            <Reply>{"Menu rows and select rows now share one height ladder, so a menu and a select at one size line up.\n\nShould I add a screenshot?"}</Reply>
          </Stack>
        </Turn>
      </Conversation>
      <Composer size="3">
        <ComposerInput aria-label="Message" placeholder="Reply to the agent" />
        <ComposerRow>
          <Flex gap="2">
            <Button iconOnly aria-label="Add attachment"><PaperclipIcon /></Button>
            <Select defaultValue="opus" items={MODELS}>
              <SelectTrigger aria-label="Model" />
              <SelectContent>
                <SelectItem value="opus">Opus 5</SelectItem>
                <SelectItem value="sonnet">Sonnet 5</SelectItem>
              </SelectContent>
            </Select>
          </Flex>
          <ComposerSend icons={SEND_ICONS} />
        </ComposerRow>
      </Composer>
    </Card>
  );
}

/** The hero composition, frame-sized; shared by the floor (tilted) and the hero (flat) so one rises into the other. */
export function HeroBody() {
  return (
    <>
      <div data-snap style={{ ...at(gx(1), gy(3)), width: gx(18) }}>
        <MembersScreen height={cells(10)} />
      </div>
      <div data-snap style={{ ...at(gx(20), gy(3)), width: gx(9) }}>
        <ChatScreen height={cells(10)} />
      </div>
    </>
  );
}

/** The grid as Womp's viewport floor: the hero lies flat on it in perspective, then rises (tilt to 0). */
export function Floor({ tilt }: { tilt: number }) {
  const fade = `linear-gradient(to bottom, transparent ${30 + tilt * 0.05}%, black ${44 + tilt * 0.1}%)`;
  return (
    <Ground grid={false}>
      <div style={{ position: "absolute", inset: 0, perspective: 1600, perspectiveOrigin: "50% 20%" }}>
        <div
          style={{
            position: "absolute",
            left: -W,
            top: -H,
            width: W * 3,
            height: H * 3,
            ...gridBg(CELL),
            backgroundPosition: `0px ${(H + 21) % CELL}px`,
            transform: `translateY(${tilt * 2.2}px) rotateX(${tilt}deg)`,
            transformOrigin: "50% 50%",
            transformStyle: "preserve-3d",
            ...(tilt > 0 ? { maskImage: fade, WebkitMaskImage: fade } : {}),
          }}
        >
          <div style={{ position: "absolute", left: W, top: H, width: W, height: H }}>
            <HeroBody />
          </div>
        </div>
      </div>
      {tilt > 0 ? <Caption>You give the intent.<br />Kookie UI makes the result.</Caption> : null}
    </Ground>
  );
}

/** Real screens composed on the grid: what a product built with Kookie looks like. */
export function Hero({ dark }: { dark?: boolean }) {
  return (
    <Ground>
      <Theme appearance={dark ? "dark" : "light"} style={{ position: "absolute", inset: 0, background: dark ? "var(--neutral-1)" : "transparent", ...(dark ? gridBg(CELL, "var(--neutral-a3)") : {}), backgroundPosition: `0px ${21}px` }}>
        <HeroBody />
      </Theme>
    </Ground>
  );
}

/** Enter progress for item `i` of `n`, staggered across `t` 0..1. */
export const stagger = (t: number, i: number, n: number, spread = 0.35) => {
  const start = (i / Math.max(1, n - 1)) * spread;
  return Math.min(1, Math.max(0, (t - start) / (1 - spread)));
};
export const rise = (k: number): React.CSSProperties => ({ opacity: k, translate: `0 ${(1 - k) * 48}px` });

export function HeroBBody({ t = 1 }: { t?: number }) {
  return (
    <>
      <div style={{ ...at(gx(1), gy(2)), width: gx(10), ...rise(stagger(t, 0, 3)) }}><SignIn /></div>
      <div style={{ ...at(gx(12), gy(2)), width: gx(9), ...rise(stagger(t, 1, 3)) }}><PlanPicker /></div>
      <div style={{ ...at(gx(22), gy(2)), width: gx(7), ...rise(stagger(t, 2, 3)) }}><DeployStatus /></div>
    </>
  );
}

export function HeroB() {
  return (
    <Ground>
      <HeroBBody />
    </Ground>
  );
}

/** Nested corners, in macro: three solid surfaces, each inset by its padding, so the curves run parallel. */
export function Nest() {
  return (
    <Stage caption={<>Inner corners follow the outer corner.</>}>
      <div style={{ ...at(gx(3), gy(5)) }}>
        <div style={{ zoom: 3, width: 600 }}>
          <Card size="4">
            <Card size="3">
              <Card size="2" style={{ background: "var(--neutral-3)" }}>
                <div style={{ height: 300 }} />
              </Card>
            </Card>
          </Card>
        </div>
      </div>
    </Stage>
  );
}

/** Reading text on a touch screen: the same paragraph, fine and coarse. */
export function TouchType() {
  const para = "Invite people to this project. They get access to every file and every comment.";
  return (
    <Stage caption={<>On a phone, text is larger.<br />It is nearer to your eyes.</>}>
      {(["fine", "coarse"] as const).map((ptr, i) => (
        <div key={ptr} style={{ ...at(gx(4 + i * 12), gy(5)), width: gx(10) }}>
          <Theme pointer={ptr}>
            <Card data-snap size="3">
              <Stack gap="3">
                <Text weight="medium">Invite people</Text>
                <Text emphasis="medium">{para}</Text>
                <Flex><Button emphasis="loud">Invite</Button></Flex>
              </Stack>
            </Card>
          </Theme>
        </div>
      ))}
      <Label x={4} y={11} w={10} quiet>mouse</Label>
      <Label x={16} y={11} w={10} quiet>touch</Label>
    </Stage>
  );
}

/** Size: one card at four sizes, standing on one grid line like a product lineup. The Theme's size
    reaches every control and the card; the type and the gaps step with it, so nothing stays behind. */
export const SNAP_GAP = { "1": "2", "2": "3", "3": "4", "4": "5" } as const;
export const SNAP_TITLE = { "1": "2", "2": "3", "3": "4", "4": "5" } as const;
export function SizeSnap({ t = 1 }: { t?: number }) {
  const SIZES = ["1", "2", "3", "4"] as const;
  const COLS = [[1, 4], [6, 6], [13, 7], [21, 8]] as const;
  return (
    <Stage caption={<>Everything scales together.</>}>
      {SIZES.map((s, i) => (
        <div key={s} style={{ position: "absolute", left: gx(COLS[i]![0]), width: gx(COLS[i]![1]), bottom: H - gy(15), display: "flex", alignItems: "flex-end", ...rise(stagger(t, i, 4, 0.5)) }}>
          <Theme size={s} style={{ width: "100%" }}>
            <Card data-snap>
              <Stack gap={SNAP_GAP[s]}>
                <Text size={SNAP_TITLE[s]} weight="medium">Share project</Text>
                <TextField placeholder="Add people" />
                <Flex gap="2" justify="end">
                  <Button>Cancel</Button>
                  <Button emphasis="loud">Share</Button>
                </Flex>
              </Stack>
            </Card>
          </Theme>
        </div>
      ))}
    </Stage>
  );
}

