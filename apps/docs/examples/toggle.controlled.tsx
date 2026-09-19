"use client";

import * as React from "react";
import { Flex, Stack, Text, Toggle, ToggleGroup } from "@kookie-ui/react";

export default function Example() {
  const [muted, setMuted] = React.useState(false);
  const [days, setDays] = React.useState<string[]>(["mon", "wed"]);

  return (
    <Stack gap="4">
      <Flex gap="3" align="center">
        <Toggle pressed={muted} onPressedChange={setMuted}>
          Mute notifications
        </Toggle>
        <Text size="2" emphasis="medium">
          {muted ? "Notifications are muted." : "Notifications are on."}
        </Text>
      </Flex>
      <ToggleGroup
        aria-label="Backup days"
        value={days}
        onValueChange={(value) => setDays(value)}
        render={<Flex gap="1" />}
      >
        <Toggle value="mon">Mon</Toggle>
        <Toggle value="tue">Tue</Toggle>
        <Toggle value="wed">Wed</Toggle>
        <Toggle value="thu">Thu</Toggle>
        <Toggle value="fri">Fri</Toggle>
      </ToggleGroup>
      <Text size="2" emphasis="medium">
        Backups run on {days.length} {days.length === 1 ? "day" : "days"} a week.
      </Text>
    </Stack>
  );
}
