import type * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Button, Flex, Grid, Stack, Text, iconStroke } from "@kushagradhawan/kookie-ui-react";

export default function OneAction() {
  return (
    <Grid columns={{ initial: "1", sm: "2" }} gap="7">
      <Verdict ok={false} why="Two loud controls compete, so neither stands out.">
        <Flex gap="3">
          <Button tone="accent" emphasis="loud">Save</Button>
          <Button tone="accent" emphasis="loud">Publish</Button>
        </Flex>
      </Verdict>
      <Verdict ok why="One main action. The other stays easy to find.">
        <Flex gap="3">
          <Button emphasis="medium">Save draft</Button>
          <Button tone="accent" emphasis="loud">Publish</Button>
        </Flex>
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
