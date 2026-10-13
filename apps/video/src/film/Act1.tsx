/**
 * Act 1: you give the intent, Kookie UI makes the result. One continuous camera over one grid
 * world. A person types an intent into a chat, the agent works, and the product changes around it:
 * a member is added, the plan follows, a deploy runs. Nothing cuts.
 */
import * as React from "react";
import { useCurrentFrame } from "remotion";
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Code,
  Composer,
  ComposerInput,
  ComposerRow,
  ComposerSend,
  Flex,
  Heading,
  Progress,
  Radio,
  RadioGroup,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Separator,
  Slider,
  Spinner,
  Stack,
  Text,
  TextField,
} from "@kushagradhawan/kookie-ui-react";
import { Conversation, Reply, Steps, Turn, UserMessage } from "../../../docs/blocks/conversation";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChartIcon,
  FolderIcon,
  HomeIcon,
  MoreIcon,
  PaperclipIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  StopSquareIcon,
  UsersIcon,
} from "../../../docs/app/icons";
import { HOVER, PRESS, Kinetic, Pointer, World, W, H, cells, gx, gy, lerp, out, ramp, streamed, track, typed, useSpring, worldPoint } from "./kit";

/* ── Script (frames at 30fps) ─────────────────────────────────────────────────────────── */

const PROMPT = "Add Kookie to the team";
const REPLY = "Done. Kookie is on the team now, and the plan has one more seat. I started a deploy.";

export const T = {
  click1: 34, // the pointer focuses the composer
  type: 42,
  send: 108, // the pointer presses send
  sent: 112,
  stepsLive: 122,
  kit: 206, // Kit's row arrives
  stepsDone: 236,
  reply: 238,
  replyEnd: 292,
  pan: 318, // the camera moves to the plan
  seats: 398,
  update: 458, // the pointer presses Update plan
  deploy: 488,
  live: 628,
  end: 742,
};

const SEND_ICONS = { ready: <ArrowUpIcon />, submitted: <ArrowUpIcon />, streaming: <StopSquareIcon />, error: <ArrowUpIcon /> };
const MODELS = { opus: "Opus 5", sonnet: "Sonnet 5" };

/* ── Screens ──────────────────────────────────────────────────────────────────────────── */

/** The caret is drawn, not native: a film frame has no focused window to blink it. Solid while typing, blinking at rest. */
const caretOn = (f: number) => {
  if (f < T.click1 + 2 || f >= T.pan) return false;
  const typingEnd = T.type + PROMPT.length * 2 + 6;
  if (f >= T.type && f < typingEnd && f < T.sent) return true;
  const from = f < T.sent ? (f < T.type ? T.click1 : typingEnd) : T.sent;
  return Math.floor((f - from) / 16) % 2 === 0;
};

function Caret({ root, text, on }: { root: React.RefObject<HTMLDivElement | null>; text: string; on: boolean }) {
  const [box, setBox] = React.useState<{ x: number; y: number; h: number } | null>(null);
  React.useLayoutEffect(() => {
    const card = root.current;
    const input = card?.querySelector<HTMLTextAreaElement>("textarea");
    if (!card || !input) return;
    const cs = getComputedStyle(input);
    const ctx = document.createElement("canvas").getContext("2d")!;
    ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const a = card.getBoundingClientRect();
    const b = input.getBoundingClientRect();
    const k = a.width / card.offsetWidth || 1; // undo the camera's scale
    const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.4;
    const next = {
      x: (b.left - a.left) / k + parseFloat(cs.paddingLeft) + ctx.measureText(text).width,
      y: (b.top - a.top) / k + parseFloat(cs.paddingTop) + (lh - parseFloat(cs.fontSize) * 1.2) / 2,
      h: parseFloat(cs.fontSize) * 1.2,
    };
    if (!box || Math.abs(box.x - next.x) > 0.1 || Math.abs(box.y - next.y) > 0.1) setBox(next);
  });
  if (!box || !on) return null;
  return <span style={{ position: "absolute", left: box.x, top: box.y, width: 1.5, height: box.h, background: "var(--accent-solid)", borderRadius: 1, zIndex: 2 }} />;
}

export function Chat({ f }: { f: number }) {
  const card = React.useRef<HTMLDivElement>(null);
  const sent = f >= T.sent;
  const status = !sent ? "ready" : f < T.stepsLive + 6 ? "submitted" : f < T.replyEnd ? "streaming" : "ready";
  const userIn = ramp(f, T.sent, T.sent + 12, out);
  const agentIn = ramp(f, T.stepsLive, T.stepsLive + 10, out);
  const summary = f < T.kit - 10 ? "Finding Kookie" : f < T.stepsDone ? "Adding Kookie to the team" : "3 steps";
  return (
    <Card ref={card} size="3" render={<Stack gap="4" />} style={{ blockSize: cells(10), position: "relative" }}>
      <Caret root={card} text={sent ? "" : typed(PROMPT, f, T.type)} on={caretOn(f)} />
      <Conversation aria-label="Conversation" jumpLabel="Jump to the latest" jumpIcon={<ArrowDownIcon />}>
        {sent ? (
          <Turn id="u1" from="person">
            <div style={{ opacity: userIn, translate: `0 ${(1 - userIn) * 24}px` }}>
              <UserMessage>{PROMPT}</UserMessage>
            </div>
          </Turn>
        ) : null}
        {f >= T.stepsLive ? (
          <Turn id="a1" from="agent">
            <Stack gap="4" style={{ opacity: agentIn }}>
              <Steps summary={summary} live={f < T.stepsDone}>
                <span />
              </Steps>
              {f >= T.reply ? <Reply>{streamed(REPLY, f, T.reply)}</Reply> : null}
            </Stack>
          </Turn>
        ) : null}
      </Conversation>
      <Composer size="3" className={f >= T.click1 + 2 && f < T.pan ? "film-focus" : undefined}>
        <ComposerInput
          data-target="input"
          aria-label="Message"
          placeholder="Ask for a change"
          value={sent ? "" : typed(PROMPT, f, T.type)}
          onChange={() => {}}
        />
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
          <span data-target="send" style={{ display: "inline-flex", scale: `${1 - 0.06 * pressAt(f, T.send)}` }}>
            <ComposerSend icons={SEND_ICONS} status={status} style={f >= T.send - 2 && f < T.sent ? PRESS : f >= T.send - 10 ? (f < T.send - 2 ? HOVER : undefined) : undefined} />
          </span>
        </ComposerRow>
      </Composer>
    </Card>
  );
}

/** A press: 0 → 1 → 0 over a few frames from `at`. */
const pressAt = (f: number, at: number) => ramp(f, at - 2, at + 2) * (1 - ramp(f, at + 4, at + 10, out));

const NAV = [
  ["Overview", <HomeIcon key="i" />],
  ["Projects", <FolderIcon key="i" />],
  ["Members", <UsersIcon key="i" />],
  ["Usage", <ChartIcon key="i" />],
  ["Settings", <SettingsIcon key="i" />],
] as const;

const PEOPLE = [
  ["SB", "Shruti Bhatia", "shruti@kookie.dev", "Owner"],
  ["SW", "Sol Whitaker", "sol@kookie.dev", "Admin"],
  ["AR", "Ada Rowe", "ada@kookie.dev", "Member"],
  ["MO", "Mei Ono", "mei@kookie.dev", "Member"],
] as const;

function PersonRow({ initials, name, email, role, chip, line }: { initials: string; name: string; email: string; role: string; chip?: React.ReactNode; line: boolean }) {
  return (
    <Box py="3" style={line ? { borderTop: "var(--border-width) solid var(--color-border)" } : undefined}>
      <Flex align="center" gap="4">
        <Avatar size="3" fallback={initials} />
        <Stack gap="1" flexGrow="1" minWidth="0">
          <Text weight="medium">{name}</Text>
          <Text size="2" emphasis="medium">{email}</Text>
        </Stack>
        {chip}
        <Text size="2" emphasis="medium" style={{ width: "4.5rem", textAlign: "end" }}>{role}</Text>
        <Button emphasis="quiet" iconOnly aria-label={`Actions for ${name}`}><MoreIcon /></Button>
      </Flex>
    </Box>
  );
}

export function Members({ f }: { f: number }) {
  const kit = ramp(f, T.kit, T.kit + 20, out);
  const chip = useSpring(f, T.kit + 14, { damping: 12, stiffness: 180 });
  const glow = ramp(f, T.kit + 4, T.kit + 20) * (1 - ramp(f, T.kit + 50, T.kit + 95));
  const added = f >= T.kit + 8;
  return (
    <Card size="4" style={{ blockSize: cells(10) }}>
      <div style={{ display: "grid", gridTemplateColumns: "12rem minmax(0, 1fr)", columnGap: "var(--layout-space-7)", height: "100%" }}>
        <Stack gap="1" render={<nav aria-label="Workspace" />}>
          {NAV.map(([label, icon]) => (
            <Button key={label} emphasis={label === "Members" ? "medium" : "quiet"} leading={icon} style={{ justifyContent: "flex-start" }}>
              {label}
            </Button>
          ))}
        </Stack>
        <Stack gap="5" minWidth="0">
          <Flex justify="space-between" align="center" gap="4">
            <Stack gap="1">
              <Heading size="6">Members</Heading>
              <Text emphasis="medium">{added ? "13 people · 7 seats left" : "12 people · 8 seats left"}</Text>
            </Stack>
            <Flex gap="3" align="center">
              <TextField placeholder="Search" leading={<SearchIcon />} aria-label="Search members" style={{ width: "12rem" }} />
              <Button emphasis="loud" leading={<PlusIcon />}>Invite</Button>
            </Flex>
          </Flex>
          <Box>
            {PEOPLE.map(([i, n, e, r], k) => (
              <PersonRow key={n} initials={i} name={n} email={e} role={r} line={k > 0} />
            ))}
            <div style={{ maxHeight: 70 * kit, overflowX: "visible", overflowY: "clip" }}>
              <div style={{ position: "relative", marginInline: -8, paddingInline: 8 }}>
                <div style={{ position: "absolute", inset: 0, borderRadius: "var(--radius-control-3)", background: `color-mix(in oklab, var(--info-soft) ${Math.round(glow * 100)}%, transparent)` }} />
                <div style={{ position: "relative" }}>
                <PersonRow
                  initials="K"
                  name="Kookie"
                  email="kookie@kookie.dev"
                  role="Member"
                  line
                  chip={<span style={{ display: "inline-flex", scale: `${chip}`, opacity: Math.min(1, chip) }}><Chip tone="info">Invited</Chip></span>}
                />
                </div>
              </div>
            </div>
          </Box>
        </Stack>
      </div>
    </Card>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Flex justify="space-between" align="baseline" gap="4">
      <Text emphasis="medium">{label}</Text>
      <Text weight="medium">{children}</Text>
    </Flex>
  );
}

const PLANS = [
  ["starter", "Starter", "Three projects, community support.", "Free"],
  ["pro", "Pro", "Unlimited projects, priority support.", "$20 / seat"],
  ["scale", "Scale", "SSO, audit log, dedicated region.", "$60 / seat"],
] as const;

export function Plan({ f }: { f: number }) {
  const seats = lerp(12, 13, ramp(f, T.seats, T.seats + 24, out));
  const shown = Math.round(seats);
  const loading = f >= T.update + 2 && f < T.update + 30;
  const done = f >= T.update + 30;
  return (
    <Card size="4">
      <Stack gap="6">
        <Stack gap="1">
          <Heading size="6">Plan</Heading>
          <Text emphasis="medium">Changes take effect on your next invoice.</Text>
        </Stack>
        <RadioGroup value="pro" aria-label="Plan">
          <Stack gap="5">
            {PLANS.map(([value, label, description, price]) => (
              <Flex key={value} gap="4" align="flex-start">
                <Radio value={value} />
                <Stack gap="1" flexGrow="1">
                  <Flex justify="space-between" gap="4">
                    <Text weight="medium">{label}</Text>
                    <Text emphasis="medium">{price}</Text>
                  </Flex>
                  <Text size="2" emphasis="medium">{description}</Text>
                </Stack>
              </Flex>
            ))}
          </Stack>
        </RadioGroup>
        <Separator />
        <Stack gap="3">
          <Flex justify="space-between" align="baseline">
            <Text weight="medium">Seats</Text>
            <Text emphasis="medium" style={{ fontVariantNumeric: "tabular-nums" }}>{shown}</Text>
          </Flex>
          <Slider value={seats} min={1} max={24} step={0.001} aria-label="Seats" />
        </Stack>
        <Stack gap="4">
          <Meta label="Billed monthly">${shown * 20}</Meta>
          <Meta label="Renews">1 November</Meta>
        </Stack>
        <span data-target="update" style={{ display: "grid", scale: `${1 - 0.03 * pressAt(f, T.update)}` }}>
          <Button tone="accent" emphasis="loud" loading={loading} done={done} style={f >= T.update - 2 && f < T.update + 2 ? PRESS : f >= T.update - 10 && f < T.update - 2 ? HOVER : undefined}>
            {done ? "Plan updated" : "Update plan"}
          </Button>
        </span>
      </Stack>
    </Card>
  );
}

export function Deploy({ f }: { f: number }) {
  const started = f >= T.deploy;
  const p = ramp(f, T.deploy + 6, T.live - 6, (t) => t);
  const live = f >= T.live;
  const pkgs = Math.round(23 * p);
  const liveIn = useSpring(f, T.live, { damping: 13, stiffness: 170 });
  return (
    <Card size="4">
      <Stack gap="6">
        <Flex justify="space-between" align="center" gap="4">
          <Heading size="6">Production deploy</Heading>
          <Button emphasis="quiet" iconOnly aria-label="Deploy actions"><MoreIcon /></Button>
        </Flex>
        <Flex gap="3" align="center" style={{ minBlockSize: 28 }}>
          {live ? (
            <span style={{ display: "inline-flex", scale: `${liveIn}` }}><Chip tone="info">Live</Chip></span>
          ) : started ? (
            <Spinner />
          ) : null}
          <Text emphasis="medium">
            {live ? "Deployed" : started ? "Building" : "Waiting for a change"} <Code>main@50ba95b</Code>
          </Text>
        </Flex>
        <Stack gap="3">
          <Flex justify="space-between" align="baseline">
            <Text weight="medium" style={{ fontVariantNumeric: "tabular-nums" }}>{pkgs} of 23 packages</Text>
            <Text emphasis="medium" style={{ fontVariantNumeric: "tabular-nums" }}>{Math.round(p * 100)}%</Text>
          </Flex>
          <Progress value={p * 100} aria-label="Build progress" />
        </Stack>
        <Stack gap="4">
          <Meta label="Commit"><Code size="2">50ba95b</Code></Meta>
          <Meta label="Branch">main</Meta>
          <Meta label="Remaining">{live ? "None" : started ? `${Math.max(1, Math.ceil((1 - p) * 40))} seconds` : "–"}</Meta>
        </Stack>
        <Flex gap="3">
          <Button emphasis="medium">View logs</Button>
          <Button emphasis="quiet" bordered>{live ? "Roll back" : "Cancel"}</Button>
        </Flex>
      </Stack>
    </Card>
  );
}

/* ── The act ──────────────────────────────────────────────────────────────────────────── */

const WORLD_W = gx(52);
const WORLD_H = H + gx(4);
const CHAT = { x: gx(20), y: gy(3), w: gx(9) };
const MEMBERS = { x: gx(1), y: gy(3), w: gx(18) };
const PLAN = { x: gx(31), y: gy(1), w: gx(9) };
const DEPLOY = { x: gx(41), y: gy(1), w: gx(9) };

function camera(f: number) {
  // Close on the chat with the words beside it; pull back to the product; travel to the plan; settle on the deploy.
  const x = track(f, [
    [0, 1010],
    [T.send, 1000],
    [212, 720],
    [T.pan, 720],
    [T.pan + 120, gx(40.5)],
    [T.deploy + 10, gx(40.5)],
    [T.live - 10, gx(44.5)],
    [T.end, gx(44.8)],
    [T.end + 60, gx(36.5)],
  ]);
  const y = track(f, [
    [0, 548],
    [T.send, 540],
    [212, 405],
    [T.pan, 405],
    [T.pan + 120, 390],
    [T.live - 10, 380],
    [T.end, 380],
    [T.end + 60, 405],
  ]);
  const s = track(f, [
    [0, 1.6],
    [T.send, 1.66],
    [212, 1],
    [T.pan, 1.01],
    [T.pan + 60, 0.9],
    [T.pan + 120, 1],
    [T.deploy + 10, 1.02],
    [T.live - 10, 1.18],
    [T.end, 1.22],
    [T.end + 60, 1],
  ]);
  return { x, y, s };
}

/** The script is written at a reading pace; the film plays it this much faster. */
const SPEED = 1.35;
export const ACT1_FRAMES = Math.ceil((T.end + 60) / SPEED);

export function Act1() {
  const f = useCurrentFrame() * SPEED;
  const cam = camera(f);
  const root = React.useRef<HTMLDivElement>(null);
  const [targets, setTargets] = React.useState<Record<string, { x: number; y: number }>>({});
  React.useLayoutEffect(() => {
    if (!root.current) return;
    const next: Record<string, { x: number; y: number }> = {};
    root.current.querySelectorAll<HTMLElement>("[data-target]").forEach((el) => {
      next[el.dataset.target!] = worldPoint(el, root.current!);
    });
    if (JSON.stringify(next) !== JSON.stringify(targets)) setTargets(next);
  });

  // The pointer lives in the world and is drawn in screen space, so it keeps its size.
  const input = targets.input ?? { x: 1170, y: 560 };
  const send = targets.send ?? { x: 1290, y: 600 };
  const update = targets.update ?? { x: 1700, y: 700 };
  const px = track(f, [
    [10, input.x + 260],
    [32, input.x - 90],
    [T.type + 30, input.x - 90],
    [T.send - 2, send.x + 2],
    [T.send + 30, send.x + 120],
    [T.update - 34, update.x + 180],
    [T.update - 2, update.x + 40],
    [T.update + 40, update.x + 140],
  ], out);
  const py = track(f, [
    [10, input.y + 220],
    [32, input.y - 4],
    [T.type + 30, input.y - 4],
    [T.send - 2, send.y + 4],
    [T.send + 30, send.y + 90],
    [T.update - 34, update.y + 160],
    [T.update - 2, update.y + 6],
    [T.update + 40, update.y + 90],
  ], out);
  const pointerOn = ramp(f, 8, 18) * (1 - ramp(f, T.send + 18, T.send + 30)) + ramp(f, T.update - 36, T.update - 26) * (1 - ramp(f, T.update + 30, T.update + 42));
  const press = Math.max(pressAt(f, T.click1), pressAt(f, T.send), pressAt(f, T.update));

  const membersIn = ramp(f, 158, 200, out);
  const open = ramp(f, 0, 18);
  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, opacity: open }}>
      <World cam={cam} width={WORLD_W} height={WORLD_H}>
        <div ref={root} style={{ position: "absolute", inset: 0 }}>
          <div style={{ position: "absolute", left: MEMBERS.x, top: MEMBERS.y, width: MEMBERS.w, opacity: membersIn, translate: `0 ${(1 - membersIn) * 40}px` }}>
            <Members f={f} />
          </div>
          <div style={{ position: "absolute", left: CHAT.x, top: CHAT.y, width: CHAT.w }}>
            <Chat f={f} />
          </div>
          <div style={{ position: "absolute", left: PLAN.x, top: PLAN.y, width: PLAN.w }}>
            <Plan f={f} />
          </div>
          <div style={{ position: "absolute", left: DEPLOY.x, top: DEPLOY.y, width: DEPLOY.w }}>
            <Deploy f={f} />
          </div>
        </div>
      </World>
      <Pointer x={W / 2 + (px - cam.x) * cam.s} y={H / 2 + (py - cam.y) * cam.s} press={press} opacity={pointerOn} kind={f >= 26 && f < T.type + PROMPT.length * 2 + 4 ? "text" : "arrow"} />
      <Kinetic text="You give the intent." f={f} inAt={22} outAt={T.send + 6} top={380} />
      <Kinetic text="Kookie UI makes the result." f={f} inAt={214} outAt={T.pan - 4} top={60} />
    </div>
  );
}
