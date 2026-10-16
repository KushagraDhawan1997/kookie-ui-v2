import type * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Flex, Grid, Heading, Stack, Text, iconStroke } from "@kushagradhawan/kookie-ui-react";

export default function Grouping() {
  return (
    <Grid columns={{ initial: "1", sm: "2" }} gap="7">
      <Verdict ok={false} why="One gap everywhere, so nothing reads as a group.">
        <Stack gap="4">
          <Heading size="6">Notifications</Heading>
          <Text emphasis="medium">Choose what reaches you, and how.</Text>
          <Heading size="6">Billing</Heading>
          <Text emphasis="medium">Cards, invoices and the plan you are on.</Text>
        </Stack>
      </Verdict>
      <Verdict ok why="Gap 2 inside each group, gap 6 between them.">
        <Stack gap="6">
          <Stack gap="2">
            <Heading size="6">Notifications</Heading>
            <Text emphasis="medium">Choose what reaches you, and how.</Text>
          </Stack>
          <Stack gap="2">
            <Heading size="6">Billing</Heading>
            <Text emphasis="medium">Cards, invoices and the plan you are on.</Text>
          </Stack>
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
