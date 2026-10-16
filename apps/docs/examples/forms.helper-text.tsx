import type * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Field, FieldDescription, FieldLabel, Flex, Grid, Stack, Text, TextField, iconStroke } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Grid columns={{ initial: "1", sm: "2" }} gap="7">
      <Verdict ok={false} why="Filler. The label already says this.">
        <Field>
          <FieldLabel>Work email</FieldLabel>
          <TextField type="email" />
          <FieldDescription>Enter your work email address.</FieldDescription>
        </Field>
      </Verdict>
      <Verdict ok why="Useful. It gives a scope the label can't carry.">
        <Field>
          <FieldLabel>Work email</FieldLabel>
          <TextField type="email" />
          <FieldDescription>Receipts and billing notices go here.</FieldDescription>
        </Field>
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
