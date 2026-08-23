/**
 * Composer's preview spec (2026-08-23) — the sixth component through the per-component
 * structure, and the first whose States section reports a state the component does not have.
 *
 * What this page is for, beyond the usual ladder: a composer is the one surface that holds
 * OTHER components at their own size, so the size section has to prove a negative — that the
 * index reaches the pane and its text and stops at the row. That was wrong in two directions
 * on the day it shipped (2026-08-23) and none of the fifteen laws read anything at two
 * indexes, which is precisely the read a page like this makes by eye in one second.
 */
import * as React from "react";
import {
  Box,
  Button,
  Card,
  Code,
  Composer,
  ComposerInput,
  ComposerRow,
  ComposerSend,
  Flex,
  Grid,
  Heading,
  Kbd,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Separator,
  Stack,
  Text,
  Theme,
  themeAxes,
} from "@kookie-ui/react";

import { BEDS, BedSurface } from "../beds";
import { Demo, SIZES, cap } from "../pieces";
import { ArrowUpIcon, BoltIcon, MicIcon, PaperclipIcon, RetryIcon, StopSquareIcon } from "../../icons";
import type { ComponentPreview } from "./types";

/** The glass rungs, DERIVED from the axis — solid is the rung where light stops and gets its
    own cell. A function, not a module const: this module is imported on the server for its
    slug, and `themeAxes` is client data (card.tsx carries the same note and the same reason). */
const glassMaterials = () => themeAxes.material.filter((m) => m !== "solid");

/** §8 ships no icon set, so the glyphs are the app's. One button, four meanings, so the
    drawing follows the meaning; `submitted` states none — Button's own spinner is what in
    flight looks like. */
const SEND = {
  ready: <ArrowUpIcon />,
  streaming: <StopSquareIcon />,
  error: <RetryIcon />,
};

/** The row every specimen uses when the row is not the thing under judgment — real controls,
    nothing invented, so the only variable is the axis being read. */
function Row({ children }: { children?: React.ReactNode }) {
  return (
    <ComposerRow>
      <Flex gap="2">
        <Button iconOnly aria-label="Add attachment"><PaperclipIcon /></Button>
        <Button>Opus 5</Button>
      </Flex>
      <Flex gap="2" align="center">
        {children}
        <ComposerSend icons={SEND} />
      </Flex>
    </ComposerRow>
  );
}

function Sizes() {
  return (
    <Stack gap="6">
      {/* The cell-level read: identical content in all four, so the only variables are the
          pane's padding, its corner, and the step its own text is set at. */}
      <Demo label="Identical content — the pane's padding, corner and text step move together">
        <Stack gap="4">
          {SIZES.map((size) => (
            <Composer key={size} size={size}>
              <ComposerInput aria-label={`Message, size ${size}`} defaultValue={`Size ${size}`} />
              <Row />
            </Composer>
          ))}
        </Stack>
      </Demo>

      {/* The negative, and the reason this page exists. A composer owns its pane and its own
          text and NOTHING in its row — Dialog prices the box alone because it does not own its
          content (§24), AlertDialog prices everything because it does (§25), and ownership is
          the difference. So the buttons below are byte-identical across all four indexes: you
          priced them where you wrote them. The failure this catches is the one that shipped —
          a size-3 composer leaving its buttons at 2 while a TextField beside them moved. */}
      <Demo label="The index stops at the row — the two extremes, holding an identical row">
        {/* Sizes 1 and 4 SIDE BY SIDE rather than all four stacked. Stacked, this read exactly
            like the ladder above it — same row, four panes — and proved nothing the first demo
            had not already shown. The extremes beside each other are the read: the pane's inset
            and its text are visibly different and the buttons between them are the same button,
            because you priced them where you wrote them. */}
        <Grid columns="repeat(2, minmax(0, 1fr))" gapX="5" gapY="5" align="flex-start">
          {(["1", "4"] as const).map((size) => (
            <Composer key={size} size={size}>
              <ComposerInput aria-label={`Owned text, size ${size}`} defaultValue={`Size ${size} pane`} />
              <ComposerRow>
                <Button size="2">Opus 5</Button>
                <ComposerSend size="2" icons={SEND} />
              </ComposerRow>
            </Composer>
          ))}
        </Grid>
      </Demo>

      {/* The ceiling is stated in `lh`, so it is the same number of LINES at every index and a
          size-4 composer is never shallower than a size-1 one. A pinned length made exactly
          that inversion before 2026-08-23. */}
      <Demo label="One line and eight, in lines — so the ceiling is the same paragraph at every index">
        <Grid columns="repeat(2, minmax(0, 1fr))" gapX="5" gapY="5" align="flex-start">
          {(["1", "4"] as const).map((size) => (
            <Composer key={size} size={size}>
              <ComposerInput
                aria-label={`Ceiling, size ${size}`}
                defaultValue={"One\nTwo\nThree\nFour\nFive\nSix\nSeven\nEight\nNine"}
              />
              <Row />
            </Composer>
          ))}
        </Grid>
      </Demo>
    </Stack>
  );
}

function States() {
  return (
    <Stack gap="6">
      {/* Live, because a focus is a thing you do. Click into the text and the ring lands on the
          PANE; tab to Send and it does not. That narrowing is `:has()` on the input, which is
          TextField's 2026-08-05 repair — a plain `:focus-within` lit the whole box whenever a
          hosted control took focus, so the box claimed a focus it did not have. */}
      <Demo label="Rest, and focus — click into the text, then tab to Send: only the caret lights the pane">
        <Stack gap="4">
          <Composer>
            <ComposerInput aria-label="Rest" placeholder="Reply to the thread…" />
            <Row />
          </Composer>
        </Stack>
      </Demo>

      {/* The component's actual state machine. This is what replaced a v1 prop that only ever
          decided whether the button was VISIBLE: a person watching a reply arrive needs a way
          to end it, and that is the third one. */}
      <Demo label="One button, four meanings — send, in flight, stop, retry">
        <Flex gap="5" align="center" wrap="wrap">
          {(["ready", "submitted", "streaming", "error"] as const).map((status) => (
            <Stack key={status} gap="2" align="center">
              <ComposerSend status={status} icons={SEND} />
              <Text size="2" emphasis="quiet">{cap(status)}</Text>
            </Stack>
          ))}
        </Flex>
      </Demo>

      {/* Growth is `field-sizing: content` — no measuring, no observers, no work on any
          keystroke. The fourth cell is past the ceiling, so its own text scrolls while the pane
          holds still. */}
      <Demo label="Empty, one line, eight, twelve — the last two panes are the same height, which is the ceiling holding">
        <Grid columns="repeat(2, minmax(0, 1fr))" gapX="5" gapY="5" align="flex-start">
          {[
            ["Empty", ""],
            ["One line", "Ship it."],
            ["Eight lines — the ceiling", "One\nTwo\nThree\nFour\nFive\nSix\nSeven\nEight"],
            ["Twelve lines — same pane, the rest scrolls", "One\nTwo\nThree\nFour\nFive\nSix\nSeven\nEight\nNine\nTen\nEleven\nTwelve"],
          ].map(([label, value]) => (
            <Stack key={label} gap="2">
              <Text size="2" emphasis="quiet">{label}</Text>
              <Composer>
                <ComposerInput aria-label={label} defaultValue={value} placeholder="Reply to the thread…" />
                <Row />
              </Composer>
            </Stack>
          ))}
        </Grid>
      </Demo>

      {/* Reported rather than drawn, because there is nothing to draw. Measured 2026-08-23:
          a Composer carrying `aria-disabled`, holding a disabled input, computes byte-identical
          to a live one on fill, ink, cursor and cast — while a `<Card render={<button
          disabled/>}>` recedes correctly in the same mount. The shared arm is
          `.kui-surface:where(button, a, label:has(.kui-control))` and a composer is a `<form>`,
          which is none of those. So a composer whose conversation is archived, rate-limited or
          signed out refuses keystrokes while looking exactly like one that accepts them —
          `readOnly`'s own 2026-08-05 defect, one family over. */}
      <Demo label="Disabled — the state the component does not have (measured, not assumed)">
        <Grid columns="repeat(2, minmax(0, 1fr))" gapX="5" gapY="5" align="flex-start">
          <Stack gap="2">
            <Text size="2" emphasis="quiet">Live</Text>
            <Composer>
              <ComposerInput aria-label="Live composer" placeholder="Reply to the thread…" />
              <Row />
            </Composer>
          </Stack>
          <Stack gap="2">
            <Text size="2" emphasis="quiet">Input disabled — the pane says nothing</Text>
            <Composer aria-disabled>
              <ComposerInput aria-label="Dead composer" placeholder="Reply to the thread…" disabled />
              <Row />
            </Composer>
          </Stack>
        </Grid>
      </Demo>
    </Stack>
  );
}

function Materials() {
  return (
    <Stack gap="6">
      {/* The canonical case for the whole selectivity rule: a conversation scrolls BEHIND the
          composer, so there is something to refract. Solid beside every rung, over every bed —
          a composer is one of the few panes that genuinely sits over moving content. */}
      {BEDS.map((b) => (
        <Demo key={b.id} label={b.name}>
          <BedSurface bed={b} minHeight="none">
            <Stack gap="5" style={{ width: "100%" }}>
              <Theme material="solid">
                <Stack gap="2">
                  <Text size="2" emphasis="quiet">Solid</Text>
                  <Composer backdrop>
                    <ComposerInput aria-label={`Solid on ${b.name}`} placeholder="Reply to the thread…" />
                    <Row />
                  </Composer>
                </Stack>
              </Theme>
              {glassMaterials().map((m) => (
                <Theme key={m} material={m}>
                  <Stack gap="2">
                    <Text size="2" emphasis="quiet">{cap(m)}</Text>
                    <Composer backdrop>
                      <ComposerInput aria-label={`${m} on ${b.name}`} placeholder="Reply to the thread…" />
                      <Row />
                    </Composer>
                  </Stack>
                </Theme>
              ))}
            </Stack>
          </BedSurface>
        </Demo>
      ))}
    </Stack>
  );
}

function Permutations() {
  return (
    <Stack gap="6">
      {/* Size × material, over the bed that has been hardest on glass. Hunting for a cell that
          reads as a different component — a corner that stops being a corner at one rung, a
          veil that swallows its own row. */}
      <Demo label="Size × material, over a hostile bed">
        <BedSurface bed={BEDS.find((b) => b.id === "swirl")!} minHeight="none">
          <Stack gap="6" style={{ width: "100%" }}>
            {glassMaterials().map((m) => (
              <Theme key={m} material={m}>
                <Stack gap="3">
                  <Text size="2" emphasis="quiet">{cap(m)}</Text>
                  {SIZES.map((size) => (
                    <Composer key={size} size={size} backdrop>
                      <ComposerInput aria-label={`${m}, size ${size}`} defaultValue={`${cap(m)} · size ${size}`} />
                      <Row />
                    </Composer>
                  ))}
                </Stack>
              </Theme>
            ))}
          </Stack>
        </BedSurface>
      </Demo>

      {/* A glass pane scopes its subtree SOLID (§10, one glass per stack), so the buttons in
          the row never paint a second veil. Judged against the same row on a solid pane: the
          controls must look identical in both. */}
      <Demo label="A glass pane scopes its row solid — the buttons must read the same on both">
        <BedSurface bed={BEDS.find((b) => b.id === "bloom")!} minHeight="none">
          <Stack gap="5" style={{ width: "100%" }}>
            <Theme material="regular">
              <Composer backdrop>
                <ComposerInput aria-label="Glass pane" defaultValue="Glass pane" />
                <Row />
              </Composer>
            </Theme>
            <Theme material="solid">
              <Composer backdrop>
                <ComposerInput aria-label="Solid pane" defaultValue="Solid pane" />
                <Row />
              </Composer>
            </Theme>
          </Stack>
        </BedSurface>
      </Demo>
    </Stack>
  );
}

function Nesting() {
  return (
    <Stack gap="6">
      {/* What it hosts. The row takes whatever the app puts there at that thing's own size —
          a Select is the ordinary model picker and a Kbd is a keyboard hint.
          Nothing here is a composer part; five of v1's eleven parts were layout wearing a
          part's name, and `ComposerRow` is the one that survived because the ring keys on the
          input above it. */}
      <Demo label="Hosting real controls — each at its own size, none of them composer parts">
        <Composer>
          <ComposerInput aria-label="Hosting" placeholder="Reply to the thread…" />
          <ComposerRow>
            <Flex gap="2" align="center">
              <Button iconOnly aria-label="Add attachment"><PaperclipIcon /></Button>
              <Select defaultValue="opus" items={{ opus: "Opus 5", sonnet: "Sonnet 5" }}>
                <SelectTrigger placeholder="Model" aria-label="Model" />
                <SelectContent>
                  <SelectItem value="opus">Opus 5</SelectItem>
                  <SelectItem value="sonnet">Sonnet 5</SelectItem>
                </SelectContent>
              </Select>
              <Button leading={<BoltIcon />}>Auto</Button>
            </Flex>
            <Flex gap="3" align="center">
              <Text size="2" emphasis="quiet"><Kbd>⇧</Kbd> <Kbd>↵</Kbd> for a new line</Text>
              <ComposerSend icons={SEND} />
            </Flex>
          </ComposerRow>
        </Composer>
      </Demo>

      {/* Where it lands. A composer is the bottom of a column whose top scrolls — the shape it
          was designed for, and the one that makes `backdrop` mean something. What must NOT
          change: the pane keeps its own corner and padding inside another surface, and the
          conversation above it owns the scrolling. */}
      <Demo label="Pinned under a conversation that scrolls — what must not change is the pane's own corner and inset">
        <Box maxWidth="40rem">
          <Card size="3" render={<Stack gap="4" />} style={{ height: "26rem" }}>
            <ScrollArea>
              <Stack gap="4">
                {[
                  ["Can you summarise the audit?", true],
                  ["Thirty-eight raised, thirty-five survived, fourteen repairs. The pattern was one mistake three times.", false],
                  ["Which three?", true],
                  ["A rule written for a top-level element, then applied to a nested one.", false],
                ].map(([line, mine], i) => (
                  <Flex key={i} justify={mine ? "flex-end" : "flex-start"}>
                    <Box maxWidth="80%">
                      <Text size="3" emphasis={mine ? "loud" : "medium"}>{line as string}</Text>
                    </Box>
                  </Flex>
                ))}
              </Stack>
            </ScrollArea>
            <Composer>
              <ComposerInput aria-label="Reply" placeholder="Reply to the thread…" />
              <Row />
            </Composer>
          </Card>
        </Box>
      </Demo>

      {/* Self-nesting, with the verdict the structure asks for. */}
      <Demo label="A composer inside a composer — refused, and not by a rule">
        <Stack gap="3">
          <Composer>
            <ComposerInput aria-label="Only composer" placeholder="Reply to the thread…" />
            <Row />
          </Composer>
          <Text size="2" emphasis="medium">
            There is no nesting case. A composer is a <Code>&lt;form&gt;</Code> and forms do not nest
            in HTML, so the browser refuses this before the system has to; and a message has
            exactly one place it is typed. The row hosts controls, never another composer.
          </Text>
        </Stack>
      </Demo>
    </Stack>
  );
}

function InUse() {
  return (
    <Stack gap="6">
      {/* An assistant composer at rest. One figure: Send is the only loud thing on the pane,
          and it is loud by default because the component places it and everything beside it is
          the caller's (§25's argument, held by anatomy). */}
      <Demo label="An assistant, waiting">
        <Box maxWidth="42rem">
          <Composer>
            <ComposerInput aria-label="Message" placeholder="Reply to the thread…" />
            <ComposerRow>
              <Flex gap="2" align="center">
                <Button iconOnly aria-label="Add attachment"><PaperclipIcon /></Button>
                <Button>Opus 5</Button>
                <Button leading={<BoltIcon />}>Auto</Button>
              </Flex>
              <Flex gap="2" align="center">
                <Button iconOnly aria-label="Dictate"><MicIcon /></Button>
                <ComposerSend icons={SEND} />
              </Flex>
            </ComposerRow>
          </Composer>
        </Box>
      </Demo>

      {/* The same composer mid-generation. The one control that changed meaning is the one the
          app has to change: Stop. Nothing else on the pane moves. */}
      <Demo label="The same composer while a reply arrives — Send became Stop">
        <Box maxWidth="42rem">
          <Composer>
            <ComposerInput aria-label="Message, generating" placeholder="Reply to the thread…" />
            <ComposerRow>
              <Flex gap="2" align="center">
                <Button iconOnly aria-label="Add attachment"><PaperclipIcon /></Button>
                <Button>Opus 5</Button>
              </Flex>
              <ComposerSend status="streaming" icons={SEND} />
            </ComposerRow>
          </Composer>
        </Box>
      </Demo>

      {/* A comment field on a document — the same component with a smaller row and a subject
          the caller wrote. It works here for the same reason it works above: a composer is a
          box you type a message into, and nothing about it assumes a model. */}
      <Demo label="A comment on a document">
        <Box maxWidth="34rem">
          <Composer size="2">
            <ComposerInput aria-label="Comment" placeholder="Leave a comment…" defaultValue="This paragraph repeats the one above it." />
            <ComposerRow>
              <Text size="2" emphasis="quiet">Visible to everyone with access</Text>
              <ComposerSend icons={SEND} labels={{ ready: "Comment" }} />
            </ComposerRow>
          </Composer>
        </Box>
      </Demo>

      {/* A support reply, with the canned-response picker a real inbox has. */}
      <Demo label="A support reply">
        <Box maxWidth="38rem">
          <Card size="3" render={<Stack gap="4" />}>
            <Stack gap="2">
              <Heading size="5" render={<h3 />}>Refund not received</Heading>
              <Text size="3" emphasis="medium">Opened four hours ago by Priya Raman.</Text>
            </Stack>
            <Separator />
            <Composer>
              <ComposerInput aria-label="Reply to Priya" placeholder="Reply to Priya…" />
              <ComposerRow>
                <Select defaultValue="none" items={{ none: "No template", refund: "Refund status" }}>
                  <SelectTrigger placeholder="Template" aria-label="Template" />
                  <SelectContent>
                    <SelectItem value="none">No template</SelectItem>
                    <SelectItem value="refund">Refund status</SelectItem>
                  </SelectContent>
                </Select>
                <ComposerSend icons={SEND} labels={{ ready: "Reply" }} />
              </ComposerRow>
            </Composer>
          </Card>
        </Box>
      </Demo>
    </Stack>
  );
}

export const composerPreview: ComponentPreview = {
  slug: "composer",
  name: "Composer",
  sections: {
    sizes: { body: <Sizes /> },
    states: { body: <States /> },
    materials: { body: <Materials /> },
    permutations: { body: <Permutations /> },
    nesting: { body: <Nesting /> },
    tones: {
      absent:
        "Refused (§11): tone is a category, and a composer categorises nothing — it is the box a person's own words go into, so there is no family for it to wear. The only tone consumer on the pane is whatever Button the caller puts in the row, which sweeps on Button's own page.",
    },
    inUse: { body: <InUse /> },
  },
};
