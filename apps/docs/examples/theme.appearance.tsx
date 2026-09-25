import { Button, Flex, Grid, Stack, Surface, Switch, Text, Theme } from "@kushagradhawan/kookie-ui-react";

const APPEARANCES = ["light", "dark"] as const;

export default function Example() {
  return (
    <Grid columns="2" gap="4" style={{ minWidth: "30rem" }}>
      {APPEARANCES.map((appearance) => (
        <Theme key={appearance} appearance={appearance}>
          <Surface size="2">
            <Stack gap="4">
              <Flex gap="3" align="center" justify="space-between" render={<label />}>
                <Text size="2">Email digests</Text>
                <Switch defaultChecked />
              </Flex>
              <Button emphasis="loud">Save settings</Button>
            </Stack>
          </Surface>
        </Theme>
      ))}
    </Grid>
  );
}
