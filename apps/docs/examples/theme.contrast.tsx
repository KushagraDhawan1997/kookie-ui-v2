import { Checkbox, Flex, Grid, Stack, Text, TextField, Theme } from "@kookie-ui/react";

const CONTRASTS = ["normal", "high"] as const;

export default function Example() {
  return (
    <Grid columns="2" gap="5" style={{ minWidth: "30rem" }}>
      {CONTRASTS.map((contrast) => (
        <Theme key={contrast} appearance="light" contrast={contrast}>
          <Stack gap="3">
            <TextField placeholder="Search settings" aria-label={`Search settings, ${contrast}`} />
            <Flex gap="2" align="center" render={<label />}>
              <Checkbox defaultChecked />
              <Text size="2">Send weekly report</Text>
            </Flex>
            <Text size="2" emphasis="quiet">
              Last sent on Monday.
            </Text>
          </Stack>
        </Theme>
      ))}
    </Grid>
  );
}
