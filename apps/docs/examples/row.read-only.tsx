import { Card, Heading, Row, Stack, Text } from "@kookie-ui/react";

const DETAILS = [
  { label: "Plan", value: "Team" },
  { label: "Seats", value: "12 of 15" },
  { label: "Renews", value: "1 October" },
  { label: "Owner", value: "Shruti Bhatia" },
];

export default function Example() {
  return (
    <Card style={{ maxWidth: "24rem" }}>
      <Stack gap="4">
        <Heading size="6">Subscription</Heading>
        <Stack gap="1" role="list">
          {DETAILS.map((detail) => (
            <Row
              key={detail.label}
              render={<div role="listitem" />}
              trailing={<Text size="2" emphasis="medium">{detail.value}</Text>}
            >
              {detail.label}
            </Row>
          ))}
        </Stack>
      </Stack>
    </Card>
  );
}
