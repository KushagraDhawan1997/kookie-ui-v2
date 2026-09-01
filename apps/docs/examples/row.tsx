import { Row, Stack, Text } from "@kookie-ui/react";
import type { Size } from "@kookie-ui/react";

export default function Example({ size = "2" }: { size?: Size }) {
  return (
    <Stack gap="1" style={{ minWidth: "18rem" }}>
      <Row size={size} current>Overview</Row>
      <Row size={size}>Deployments</Row>
      <Row size={size} trailing={<Text size="2" emphasis="quiet">12</Text>}>Environments</Row>
      <Row size={size} disabled>Billing</Row>
      <Row size={size} tone="destructive">Delete project</Row>
    </Stack>
  );
}
