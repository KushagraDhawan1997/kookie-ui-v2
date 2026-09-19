"use client";
// SCRATCH — a picture of the composer "tray" proposal, to decide from. Not the implementation.
import * as React from "react";
import {
  Theme,
  Surface,
  Notice,
  Button,
  Composer,
  ComposerInput,
  ComposerRow,
  ComposerSend,
  Stack,
  Flex,
  Text,
  Heading,
  Box,
} from "@kookie-ui/react";
import { BedSurface, PHOTO_BED } from "../preview/beds";
import { ArrowUpIcon, PaperclipIcon } from "../icons";

const CSS = `
.sc-unit { position: relative; display: flex; flex-direction: column; inline-size: 34rem; max-inline-size: 100%; }
.sc-unit > .kui-composer { position: relative; z-index: 1; }
.sc-label { max-inline-size: 34rem; }

/* THE BOTTOM TRAY: a ground-coloured surface tucked behind the composer, inset from its sides so
   it reads as part of the composer rather than a second card. Its top is hidden under the
   composer; its bottom corners are the composer's corner less the inset (concentric). */
.sc-tray {
  --sc-r: 45.164px; --sc-inset: 16px;
  margin-inline: var(--sc-inset);
  margin-block-start: calc(-1 * var(--sc-r));
  padding: calc(var(--sc-r) + 8px) 16px 10px;
  border-radius: 0 0 calc(var(--sc-r) - var(--sc-inset)) calc(var(--sc-r) - var(--sc-inset));
}

/* THE NOTICE STACK: real Notices, apart from the composer by a gap. Collapsed, they are a deck —
   the newest in front, full width, nearest the composer; each older one peeks above it, a step
   narrower. Hover or focus inside fans them out into a column. */
.sc-stack { display: grid; margin-block-end: 12px; padding-block-start: calc(var(--sc-peek) * (min(var(--sc-n), 3) - 1)); --sc-peek: 10px; }
.sc-stack > * {
  grid-area: 1 / 1; align-self: end;
  transform-origin: 50% 0;
  translate: 0 calc(-1 * var(--i) * var(--sc-peek));
  scale: calc(1 - var(--i) * 0.04);
  z-index: calc(10 - var(--i));
  transition: translate 300ms var(--motion-easing), scale 300ms var(--motion-easing), opacity 200ms;
}
.sc-stack > [data-i-hidden] { opacity: 0; pointer-events: none; }
/* Behind cards show no content: only their edge is meant to be read. */
.sc-stack:not(:hover, :focus-within) > :not([data-front]) > .kui-notice > * { visibility: hidden; }
.sc-stack > * > .kui-notice { inline-size: 100%; box-sizing: border-box; }
.sc-stack:hover, .sc-stack:focus-within { display: flex; flex-direction: column; gap: 8px; padding-block-start: 0; }
.sc-stack:hover > *, .sc-stack:focus-within > * { align-self: stretch; translate: none; scale: none; opacity: 1; pointer-events: auto; }
`;

function Send() {
  return <ComposerSend icons={{ ready: <ArrowUpIcon /> }} />;
}

function Plain({ placeholder = "Describe what you need", backdrop }: { placeholder?: string; backdrop?: boolean }) {
  return (
    <Composer size="2" {...(backdrop !== undefined ? { backdrop } : {})} onSubmit={() => {}}>
      <ComposerInput aria-label="Message" placeholder={placeholder} />
      <ComposerRow>
        <Button size="2" emphasis="quiet" iconOnly aria-label="Attach">
          <PaperclipIcon />
        </Button>
        <Send />
      </ComposerRow>
    </Composer>
  );
}

function ContextRow() {
  return (
    <Flex justify="space-between" align="center" gap="3">
      <Text size="1" emphasis="medium">Opus 5 · Plan mode</Text>
      <Text size="1" emphasis="medium">42% of context · $0.08 today</Text>
    </Flex>
  );
}

function Tray({ children }: { children: React.ReactNode }) {
  return (
    <Surface size="2" className="sc-tray">
      {children}
    </Surface>
  );
}

type Item = { id: number; kind: "approval" | "limit" | "queued" | "changed" };

function NoticeFor({ item, glass, onDone }: { item: Item; glass?: boolean; onDone: () => void }) {
  const g = glass ? { backdrop: true } : {};
  switch (item.kind) {
    case "approval":
      return (
        <Notice size="2" {...g} action={<Button size="2" emphasis="loud" tone="accent" onClick={onDone}>Run</Button>} onDismiss={onDone} dismissLabel="Not now">
          Run 4 nodes for $0.32?
        </Notice>
      );
    case "limit":
      return (
        <Notice size="2" tone="warning" {...g} onDismiss={onDone}>
          You have used 90% of today's budget.
        </Notice>
      );
    case "queued":
      return (
        <Notice size="2" {...g} onDismiss={onDone} dismissLabel="Remove">
          Queued: "and make the shadow softer"
        </Notice>
      );
    case "changed":
      return (
        <Notice size="2" {...g} action={<Button size="2" onClick={onDone}>Review</Button>} onDismiss={onDone}>
          3 nodes changed
        </Notice>
      );
  }
}

/** Oldest first; the last is the newest and sits in front. */
function Stack3({ items, glass, remove }: { items: Item[]; glass?: boolean; remove: (id: number) => void }) {
  if (items.length === 0) return null;
  return (
    <div className="sc-stack" style={{ ["--sc-n" as string]: items.length }}>
      {items.map((item, idx) => {
        const i = items.length - 1 - idx;
        return (
          <div
            key={item.id}
            style={{ ["--i" as string]: i }}
            {...(i === 0 ? { "data-front": "" } : {})}
            {...(i > 2 ? { "data-i-hidden": "" } : {})}
          >
            <NoticeFor item={item} {...(glass ? { glass } : {})} onDone={() => remove(item.id)} />
          </div>
        );
      })}
    </div>
  );
}

const KINDS: Item["kind"][] = ["queued", "limit", "changed", "approval"];

function useItems(initial: Item["kind"][]) {
  const [items, setItems] = React.useState<Item[]>(() => initial.map((kind, id) => ({ id, kind })));
  const next = React.useRef(initial.length);
  const add = () => setItems((all) => [...all, { id: next.current++, kind: KINDS[next.current % KINDS.length]! }]);
  const remove = (id: number) => setItems((all) => all.filter((x) => x.id !== id));
  return { items, add, remove };
}

function Label({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <Stack gap="1" className="sc-label">
      <Heading size="5">
        {n}. {title}
      </Heading>
      <Text size="2" emphasis="medium">{children}</Text>
    </Stack>
  );
}

function SolidScenes() {
  const one = useItems(["approval"]);
  const many = useItems(["queued", "limit", "approval"]);
  return (
    <Stack gap="8" p="6">
      <Stack gap="3">
        <Label n="1" title="Today">The composer on its own.</Label>
        <div className="sc-unit">
          <Plain />
        </div>
      </Stack>

      <Stack gap="3">
        <Label n="2" title="Below: an inset tray">
          A ground-coloured surface tucked behind the composer, narrower than it. Quiet information only.
        </Label>
        <div className="sc-unit">
          <Plain />
          <Tray>
            <ContextRow />
          </Tray>
        </div>
      </Stack>

      <Stack gap="3">
        <Label n="3" title="Above: one notice">
          A real Notice, standing apart from the composer. Run is its action; the ✕ is "Not now".
        </Label>
        <div className="sc-unit">
          <Stack3 items={one.items} remove={one.remove} />
          <Plain placeholder="Or tell it what to do instead" />
          <Tray>
            <ContextRow />
          </Tray>
        </div>
        <Flex><Button size="1" emphasis="quiet" onClick={one.add}>Add a notice</Button></Flex>
      </Stack>

      <Stack gap="3">
        <Label n="4" title="Above: several notices, stacked">
          The newest in front; older ones peek above it, a step narrower. Hover the stack to fan them out. Dismiss the
          front one and the next comes forward.
        </Label>
        <div className="sc-unit">
          <Stack3 items={many.items} remove={many.remove} />
          <Plain placeholder="Or tell it what to do instead" />
          <Tray>
            <ContextRow />
          </Tray>
        </div>
        <Flex><Button size="1" emphasis="quiet" onClick={many.add}>Add a notice</Button></Flex>
      </Stack>
    </Stack>
  );
}

function GlassScenes() {
  const many = useItems(["queued", "limit", "approval"]);
  return (
    <Theme material="regular">
      <BedSurface bed={PHOTO_BED} backdrop>
        <Stack gap="3" p="6">
          <Label n="5" title="Over a photo, everything glass">
            Glass notices and a glass composer. The notices only overlap each other, in the deck.
          </Label>
          <div className="sc-unit">
            <Stack3 items={many.items} remove={many.remove} glass />
            <Plain backdrop placeholder="Or tell it what to do instead" />
            <Tray>
              <ContextRow />
            </Tray>
          </div>
          <Box height="4rem" />
        </Stack>
      </BedSurface>
    </Theme>
  );
}

export default function Page() {
  return (
    <>
      <style>{CSS}</style>
      <Theme appearance="light">
        <SolidScenes />
      </Theme>
      <GlassScenes />
    </>
  );
}
