import { Progress, Stack, Text } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Stack gap="2" style={{ flexGrow: 1, maxWidth: "28rem" }}>
      <Text size="2" id="index-label">Indexing the repository</Text>
      <Progress value={null} aria-labelledby="index-label" />
      <Text size="2" emphasis="quiet">This can take a few minutes for large projects.</Text>
    </Stack>
  );
}
