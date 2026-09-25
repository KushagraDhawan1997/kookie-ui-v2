"use client";

/**
 * The Conversation block's demos: whole screens, because the parts are only the parts of one.
 * Each is a card of a fixed height holding the transcript over a composer, which is the shape
 * every chat has. Client code because a screen has handlers; the block file is the same one a
 * reader copies.
 */
import * as React from "react";
import {
  Button,
  Card,
  Composer,
  ComposerInput,
  ComposerRow,
  ComposerSend,
  Confirmation,
  Notice,
  Stack,
  Text,
} from "@kushagradhawan/kookie-ui-react";

import {
  Conversation,
  Pictures,
  Reply,
  Step,
  Steps,
  Thinking,
  Turn,
  UserMessage,
} from "../../../blocks/conversation";
import { EmptyState } from "../../../blocks/empty-state";
import { ArrowDownIcon, ArrowUpIcon, StopSquareIcon } from "../../icons";

const SEND_ICONS = { ready: <ArrowUpIcon />, submitted: <ArrowUpIcon />, streaming: <StopSquareIcon />, error: <ArrowUpIcon /> };

/** A card the height of a small chat window: the transcript takes what the composer leaves. */
function Screen({
  children,
  status = "ready",
  onSend,
  onStop,
  notices,
  placeholder = "Describe what you need",
}: {
  children: React.ReactNode;
  status?: "ready" | "submitted" | "streaming";
  onSend?: (text: string) => void;
  onStop?: () => void;
  notices?: React.ReactNode;
  placeholder?: string;
}) {
  const [text, setText] = React.useState("");
  return (
    <Card size="3" render={<Stack gap="4" />} style={{ blockSize: "34rem" }}>
      {children}
      <Composer
        size="3"
        notices={notices}
        context={<Text size="2">Opus 5 · 42% of context · $0.08 today</Text>}
        onSubmit={(event) => {
          event.preventDefault();
          if (!text.trim() || status !== "ready") return;
          onSend?.(text);
          setText("");
        }}
      >
        <ComposerInput
          aria-label="Message the agent"
          placeholder={placeholder}
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <ComposerRow>
          <span />
          <ComposerSend
            status={status}
            icons={SEND_ICONS}
            {...(onStop ? { onStop } : {})}
            disabled={status === "ready" ? !text.trim() : false}
          />
        </ComposerRow>
      </Composer>
    </Card>
  );
}

function Jump() {
  return {
    "aria-label": "Conversation",
    jumpLabel: "Jump to the latest",
    jumpIcon: <ArrowDownIcon />,
  } as const;
}

/** A thread with history: long enough to scroll, so it opens at its end and the jump button
    appears the moment you leave it. */
export function FinishedThread() {
  return (
    <Screen>
      <Conversation {...Jump()}>
        <Turn id="u1" from="person">
          <UserMessage attachments={<div role="img" aria-label="Product shot" style={{ aspectRatio: "4 / 3" }} />}>
            Launch images for a new sneaker, from this product shot
          </UserMessage>
        </Turn>
        <Turn id="a1" from="agent">
          <Stack gap="5">
            <Steps summary="6 steps">
              <Step>Read the graph</Step>
              <Step>Looked at the product shot</Step>
              <Step>Added 10 nodes</Step>
              <Step title="2 of 4 failed: the model wants at least 655,360 pixels">
                2 of 4 failed: the model wants at least 655,360 pixels
              </Step>
              <Step>Made 4 changes</Step>
              <Step>Ran 4 nodes</Step>
            </Steps>
            <Pictures>
              <div role="img" aria-label="Draft 1" />
              <div role="img" aria-label="Draft 2" />
              <div role="img" aria-label="Draft 3" />
              <div role="img" aria-label="Draft 4" />
            </Pictures>
            <Reply>Four directions for about eight cents. Which one should the finals follow?</Reply>
          </Stack>
        </Turn>
        <Turn id="u2" from="person">
          <UserMessage>The second one, but warmer light</UserMessage>
        </Turn>
        <Turn id="a2" from="agent">
          <Stack gap="5">
            <Step>Changed the light on 2 nodes</Step>
            <Pictures>
              <div role="img" aria-label="Final, portrait" style={{ inlineSize: "40%", aspectRatio: "2 / 3" }} />
            </Pictures>
            <Reply>{"Warmer, and a touch lower so the sole catches it.\nWant the square crop too?"}</Reply>
          </Stack>
        </Turn>
      </Conversation>
    </Screen>
  );
}

/** Nothing yet: the one thing to read sits in the middle of the transcript. */
export function EmptyThread() {
  return (
    <Screen>
      <Conversation {...Jump()} empty={<EmptyState title="Ask the agent" description="It builds on the canvas beside it." />} />
    </Screen>
  );
}

/** It stops before it spends. The question waits at the composer, where the next thing is typed:
    answer it with a button, or type "no, do this instead". The transcript records only the answer. */
export function AskingThread() {
  const [answer, setAnswer] = React.useState<"open" | "busy" | "declined" | "redirected" | "done">("open");
  const [redirect, setRedirect] = React.useState("");
  React.useEffect(() => {
    if (answer !== "busy") return;
    const timer = window.setTimeout(() => setAnswer("done"), 1600);
    return () => window.clearTimeout(timer);
  }, [answer]);
  const waiting = answer === "open" || answer === "busy";
  return (
    <Screen
      placeholder={waiting ? "Or tell it what to do instead" : "Describe what you need"}
      onSend={(text) => {
        if (waiting) {
          setRedirect(text);
          setAnswer("redirected");
        }
      }}
      notices={
        waiting ? (
          <Confirmation
            confirmLabel="Run"
            cancelLabel="Not now"
            busy={answer === "busy"}
            onConfirm={() => setAnswer("busy")}
            onCancel={() => setAnswer("declined")}
          >
            Run 4 nodes for $0.32?
          </Confirmation>
        ) : null
      }
    >
      <Conversation {...Jump()}>
        <Turn id="u1" from="person">
          <UserMessage>Render all four at full size</UserMessage>
        </Turn>
        <Turn id="a1" from="agent">
          <Stack gap="5">
            <Steps summary="2 steps">
              <Step>Read the graph</Step>
              <Step>Priced at $0.32</Step>
            </Steps>
            <Reply>That is four runs of the large model.</Reply>
          </Stack>
        </Turn>
        {answer === "declined" ? (
          <Turn id="a2" from="agent">
            <Step>Not run</Step>
          </Turn>
        ) : null}
        {answer === "redirected" ? (
          <>
            <Turn id="a2" from="agent">
              <Step>Not run</Step>
            </Turn>
            <Turn id="u2" from="person">
              <UserMessage>{redirect}</UserMessage>
            </Turn>
          </>
        ) : null}
        {answer === "done" ? (
          <Turn id="a2" from="agent">
            <Stack gap="5">
              <Step>Ran 4 nodes</Step>
              <Pictures>
                <div role="img" aria-label="Final 1" />
                <div role="img" aria-label="Final 2" />
                <div role="img" aria-label="Final 3" />
                <div role="img" aria-label="Final 4" />
              </Pictures>
            </Stack>
          </Turn>
        ) : null}
      </Conversation>
    </Screen>
  );
}

/** A failure that stops the turn waits at the composer too, with the one action that answers it. */
export function FailedThread() {
  return (
    <Screen
      notices={
        <Notice tone="destructive" action={<Button>Try again</Button>}>
          The model did not answer. Nothing on the canvas changed.
        </Notice>
      }
    >
      <Conversation {...Jump()}>
        <Turn id="u1" from="person">
          <UserMessage>Make the background a studio grey</UserMessage>
        </Turn>
        <Turn id="a1" from="agent">
          <Step>Read the graph</Step>
        </Turn>
      </Conversation>
    </Screen>
  );
}

/* THE LIVE REPLAY. A scripted agent, so the transcript's real behaviour can be seen: your message
   anchors near the top, the run's line sweeps while it works, the steps arrive one by one, and the
   reply streams in word by word while the transcript follows it — unless you scroll up, when it
   leaves you alone and the jump button appears. */

const SCRIPT_STEPS = ["Reading the graph", "Adding 6 nodes", "Running 6 nodes"];
const SCRIPT_DONE = ["Read the graph", "Added 6 nodes", "Ran 6 nodes"];
const SCRIPT_REPLY =
  "Six variations are on the canvas: three lighting setups, each at two camera heights. The low camera reads more heroic, and the warm key light keeps the leather from going flat. The two I would keep are the first and the fifth. If you want, I can take those two to full size and try a softer shadow on the fifth, which is the one place the product still reads a little cut out from its floor.";

type Exchange = { id: string; ask: string; phase: "thinking" | "steps" | "reply" | "done"; steps: number; words: number };

export function LiveThread() {
  const [exchanges, setExchanges] = React.useState<Exchange[]>([]);
  const words = React.useMemo(() => SCRIPT_REPLY.split(" "), []);
  const current = exchanges.at(-1);
  const working = current !== undefined && current.phase !== "done";

  React.useEffect(() => {
    if (!current || current.phase === "done") return;
    const step = (next: Partial<Exchange>) =>
      setExchanges((all) => all.map((e) => (e.id === current.id ? { ...e, ...next } : e)));
    const delay = current.phase === "reply" ? 45 : current.phase === "thinking" ? 900 : 1100;
    const timer = window.setTimeout(() => {
      if (current.phase === "thinking") step({ phase: "steps", steps: 1 });
      else if (current.phase === "steps")
        step(current.steps < SCRIPT_STEPS.length ? { steps: current.steps + 1 } : { phase: "reply", words: 1 });
      else if (current.phase === "reply")
        step(current.words < words.length ? { words: current.words + 1 } : { phase: "done" });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [current, words.length]);

  const send = (ask: string) =>
    setExchanges((all) => [...all, { id: `x${all.length}`, ask, phase: "thinking", steps: 0, words: 0 }]);
  const stop = () => setExchanges((all) => all.map((e, i) => (i === all.length - 1 ? { ...e, phase: "done" } : e)));

  return (
    <Screen
      status={working ? (current.phase === "thinking" ? "submitted" : "streaming") : "ready"}
      onSend={send}
      onStop={stop}
      placeholder="Send anything: the agent here is scripted"
    >
      <Conversation
        {...Jump()}
        empty={<EmptyState title="Send a message" description="A scripted agent answers, so you can watch the transcript follow it." />}
      >
        {exchanges.flatMap((e) => {
          const live = e.phase !== "done";
          const done = e.phase === "reply" || e.phase === "done";
          return [
            <Turn key={`${e.id}u`} id={`${e.id}u`} from="person">
              <UserMessage>{e.ask}</UserMessage>
            </Turn>,
            <Turn key={`${e.id}a`} id={`${e.id}a`} from="agent">
              {e.phase === "thinking" ? (
                <Thinking>Thinking</Thinking>
              ) : (
                <Stack gap="5">
                  <Steps
                    summary={done ? `${e.steps} steps` : SCRIPT_STEPS[e.steps - 1]}
                    live={live && e.phase === "steps"}
                  >
                    {Array.from({ length: e.steps }, (_, i) => {
                      const pending = e.phase === "steps" && i === e.steps - 1;
                      return (
                        <Step key={i} pending={pending}>
                          {pending ? SCRIPT_STEPS[i] : SCRIPT_DONE[i]}
                        </Step>
                      );
                    })}
                  </Steps>
                  {e.words > 0 ? <Reply>{words.slice(0, e.words).join(" ")}</Reply> : null}
                </Stack>
              )}
            </Turn>,
          ];
        })}
      </Conversation>
    </Screen>
  );
}
