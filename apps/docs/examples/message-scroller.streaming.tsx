"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown02Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  Card,
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  ScrollArea,
  Stack,
  Text,
  iconStroke,
} from "@kookie-ui/react";

type Turn = { id: string; role: "question" | "answer"; text: string };

const reply =
  "Your storage is at 42 of 100 gigabytes. Most of it is build caches from the billing service. " +
  "You can clear old caches in the project settings, or move to the Team plan for more room. " +
  "Caches older than 30 days are not used by any current deploy, so clearing them is safe.";

// Send a question to watch the reply arrive. While you are at the end, the
// transcript follows the new words. Scroll up and it stops, until you come back.
export default function Example() {
  const [turns, setTurns] = React.useState<Turn[]>([
    { id: "q0", role: "question", text: "Which project uses the most build minutes?" },
    {
      id: "a0",
      role: "answer",
      text: "The billing service used 61% of this month's build minutes.",
    },
  ]);
  const [streaming, setStreaming] = React.useState(false);

  const send = () => {
    const n = turns.length;
    const answerId = `a${n}`;
    setTurns((all) => [
      ...all,
      { id: `q${n}`, role: "question", text: "Why is my storage almost full?" },
      { id: answerId, role: "answer", text: "" },
    ]);
    setStreaming(true);
    const words = reply.split(" ");
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      setTurns((all) =>
        all.map((turn) =>
          turn.id === answerId ? { ...turn, text: words.slice(0, i).join(" ") } : turn,
        ),
      );
      if (i >= words.length) {
        window.clearInterval(timer);
        setStreaming(false);
      }
    }, 60);
  };

  return (
    <Stack gap="3" style={{ maxWidth: "32rem" }}>
      <Card size="3" style={{ height: "18rem" }}>
        <MessageScroller>
          <ScrollArea fade aria-label="Conversation with the assistant">
            <MessageScrollerContent>
              {turns.map((turn) => (
                <MessageScrollerItem
                  key={turn.id}
                  messageId={turn.id}
                  scrollAnchor={turn.role === "question"}
                >
                  <Stack gap="1">
                    <Text size="2" emphasis="medium">
                      {turn.role === "question" ? "Shruti Bhatia" : "Assistant"}
                    </Text>
                    <Text size="3">{turn.text}</Text>
                  </Stack>
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
            <MessageScrollerButton aria-label="Jump to the latest message">
              <HugeiconsIcon icon={ArrowDown02Icon} strokeWidth={iconStroke} aria-hidden />
            </MessageScrollerButton>
          </ScrollArea>
        </MessageScroller>
      </Card>
      <Button emphasis="loud" onClick={send} disabled={streaming}>
        Ask about storage
      </Button>
    </Stack>
  );
}
