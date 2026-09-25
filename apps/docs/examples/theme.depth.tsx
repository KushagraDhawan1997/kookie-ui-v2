import { Button, Card, Grid, Stack, Surface, Text, Theme } from "@kushagradhawan/kookie-ui-react";

const DEPTHS = ["flat", "elevated"] as const;

export default function Example() {
  return (
    <Surface size="3">
      <Grid columns="2" gap="4" style={{ minWidth: "30rem" }}>
        {DEPTHS.map((depth) => (
          <Theme key={depth} depth={depth}>
            <Card size="2">
              <Stack gap="3">
                <Text size="3" weight="medium">
                  Pro plan
                </Text>
                <Text size="2" emphasis="medium">
                  Unlimited projects and ten seats.
                </Text>
                <Button emphasis="loud">Upgrade</Button>
              </Stack>
            </Card>
          </Theme>
        ))}
      </Grid>
    </Surface>
  );
}
