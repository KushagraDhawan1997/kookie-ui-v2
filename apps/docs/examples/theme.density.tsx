import { Button, Flex, Stack, Text, TextField, Theme } from "@kushagradhawan/kookie-ui-react";

const DENSITIES = ["compact", "default", "comfortable"] as const;

export default function Example() {
  return (
    <Stack gap="5" style={{ minWidth: "26rem" }}>
      {DENSITIES.map((density) => (
        <Theme key={density} density={density}>
          <Stack gap="2">
            <Text size="2" emphasis="medium">
              {density}
            </Text>
            <Flex gap="2">
              <TextField placeholder="Invite by email" aria-label={`Invite by email, ${density}`} />
              <Button>Invite</Button>
            </Flex>
          </Stack>
        </Theme>
      ))}
    </Stack>
  );
}
