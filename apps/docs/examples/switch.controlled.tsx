"use client";

import * as React from "react";
import { Flex, Stack, Switch, Text } from "@kookie-ui/react";

export default function Example() {
  const [enabled, setEnabled] = React.useState(false);

  return (
    <Stack gap="2">
      <Flex gap="3" align="center">
        <Switch id="auto-renew" checked={enabled} onCheckedChange={setEnabled} />
        <Text size="2" render={<label htmlFor="auto-renew" />}>
          Renew my plan automatically
        </Text>
      </Flex>
      <Text size="2" emphasis="medium">
        {enabled ? "Your plan renews on 1 October." : "Your plan ends on 1 October."}
      </Text>
    </Stack>
  );
}
