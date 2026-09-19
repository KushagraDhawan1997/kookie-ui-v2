import { Card, Flex, Heading, Progress, Stack, Text } from "@kookie-ui/react";

const FILES = [
  { name: "brand-guidelines.pdf", value: 100, note: "Done" },
  { name: "launch-video.mp4", value: 42, note: "42%" },
  { name: "press-kit.zip", value: null, note: "Waiting" },
];

export default function Example() {
  return (
    <Card style={{ flexGrow: 1, maxWidth: "28rem" }}>
      <Stack gap="5">
        <Heading size="6">Uploads</Heading>
        {FILES.map((file) => (
          <Stack key={file.name} gap="2">
            <Flex justify="space-between" gap="3">
              <Text size="2" id={`upload-${file.name}`}>{file.name}</Text>
              <Text size="2" emphasis="quiet">{file.note}</Text>
            </Flex>
            <Progress value={file.value} aria-labelledby={`upload-${file.name}`} />
          </Stack>
        ))}
      </Stack>
    </Card>
  );
}
