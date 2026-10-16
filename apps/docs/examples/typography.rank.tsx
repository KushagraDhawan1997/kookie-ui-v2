import type * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Flex, Grid, Heading, Stack, Text, iconStroke } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Grid columns={{ initial: "1", sm: "2" }} gap="7">
      <Verdict ok={false} why="Same size, heavier weight, so the two lines compete.">
        <Stack gap="2">
          <Heading size="6" weight="semibold">Notifications</Heading>
          <Text size="6" weight="medium">Choose what reaches you</Text>
        </Stack>
      </Verdict>
      <Verdict ok why="A smaller step and a quieter colour, so the title leads.">
        <Stack gap="2">
          <Heading size="6">Notifications</Heading>
          <Text size="3" emphasis="medium">Choose what reaches you</Text>
        </Stack>
      </Verdict>
    </Grid>
  );
}

// A large mark, then the thing being judged, then why.
function Verdict({ ok, why, children }: { ok: boolean; why: string; children: React.ReactNode }) {
  return (
    <Stack gap="3">
      <Text tone={ok ? "success" : "destructive"} render={<Flex />}>
        <HugeiconsIcon
          icon={ok ? Tick02Icon : Cancel01Icon}
          size={28}
          strokeWidth={iconStroke}
          aria-label={ok ? "Right" : "Wrong"}
        />
      </Text>
      {children}
      <Text size="2" emphasis="medium">
        {why}
      </Text>
    </Stack>
  );
}
