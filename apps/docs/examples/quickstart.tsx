import {
  Button,
  Card,
  Checkbox,
  Flex,
  Heading,
  Stack,
  Text,
} from "@kookie-ui/react";

export default function Publish() {
  return (
    <Card size="4">
      <Stack gap="6">
        <Stack gap="2">
          <Heading size="6">Publish site</Heading>
          <Text emphasis="medium">
            Your site goes live at kookie.dev when the build
            finishes.
          </Text>
        </Stack>

        <Stack gap="5">
          <Flex align="center" gap="3">
            <Checkbox id="tests" defaultChecked />
            <Text render={<label htmlFor="tests" />}>
              Run tests before publishing
            </Text>
          </Flex>
          <Flex align="center" gap="3">
            <Checkbox id="notify" />
            <Text render={<label htmlFor="notify" />}>
              Notify the team in Slack
            </Text>
          </Flex>
        </Stack>

        <Flex gap="3" justify="flex-end">
          <Button emphasis="quiet" bordered>
            Cancel
          </Button>
          <Button tone="accent" emphasis="loud">
            Publish
          </Button>
        </Flex>
      </Stack>
    </Card>
  );
}
