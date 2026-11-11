"use client";

import { Box, Flex, Stack, Text, Theme, useSurface, type Tone } from "@kushagradhawan/kookie-ui-react";

// A calendar event of your own. `useSurface` gives the element the system's fill for its tone,
// text that reads on that fill, and the theme's glass where it sits over a picture. Its props
// go on any element: a `Box` here, or a plain `div`.
function CalendarEvent({ title, time, tone, loud }: { title: string; time: string; tone: Tone; loud?: boolean }) {
  const surface = useSurface({ tone, emphasis: loud ? "loud" : "medium", backdrop: true, size: "1" });
  return (
    <Box {...surface.props}>
      {surface.scope(
        <Stack gap="1">
          <Text size="2" weight="medium">
            {title}
          </Text>
          <Text size="2" emphasis="medium">
            {time}
          </Text>
        </Stack>,
      )}
    </Box>
  );
}

// A day in the calendar's header. The `control` family gives it a button's height and round
// corner, and `iconOnly` makes it as wide as it is tall. Today is the loud one.
function Day({ date, today }: { date: string; today?: boolean }) {
  const surface = useSurface({
    family: "control",
    iconOnly: true,
    tone: today ? "accent" : "neutral",
    emphasis: today ? "loud" : "quiet",
    backdrop: true,
  });
  return (
    <Box {...surface.props} {...(today ? { "aria-current": "date" } : {})}>
      {surface.scope(date)}
    </Box>
  );
}

export default function Example() {
  return (
    <Theme material="3">
      <Box
        p="4"
        render={<section aria-label="Today's events" />}
        style={{ minWidth: "18rem", backgroundImage: "url(/backdrop.jpg)", backgroundSize: "cover" }}
      >
        <Stack gap="2">
          <Flex gap="2">
            {["12", "13", "14", "15", "16"].map((date) => (
              <Day key={date} date={date} today={date === "14"} />
            ))}
          </Flex>
          <CalendarEvent title="Design review" time="9:30 to 10:15" tone="accent" loud />
          <Flex gap="2">
            <Box flexGrow="1" flexBasis="0">
              <CalendarEvent title="Lunch with Ana" time="12:30 to 13:30" tone="neutral" />
            </Box>
            <Box flexGrow="1" flexBasis="0">
              <CalendarEvent title="Flight to Valencia" time="18:40" tone="info" />
            </Box>
          </Flex>
        </Stack>
      </Box>
    </Theme>
  );
}
