"use client";

import * as React from "react";
import { Button, Flex, Stack, Switch, Text } from "@kookie-ui/react";

export default function Example() {
  const [saved, setSaved] = React.useState<string | null>(null);

  return (
    <Stack
      gap="4"
      render={
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            setSaved(data.get("backups") === "on" ? "Nightly backups are on." : "Nightly backups are off.");
          }}
        />
      }
    >
      <Flex gap="3" align="center">
        <Switch id="backups" name="backups" defaultChecked />
        <Text size="2" render={<label htmlFor="backups" />}>
          Run nightly backups
        </Text>
      </Flex>
      <Flex gap="3" align="center">
        <Button type="submit" emphasis="loud">
          Save settings
        </Button>
        {saved && (
          <Text size="2" emphasis="medium">
            {saved}
          </Text>
        )}
      </Flex>
    </Stack>
  );
}
