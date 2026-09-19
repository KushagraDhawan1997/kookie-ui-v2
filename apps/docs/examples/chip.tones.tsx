import { Chip, Flex } from "@kookie-ui/react";

export default function Example() {
  return (
    <Flex gap="3" align="center" wrap="wrap">
      <Chip size="2">Draft</Chip>
      <Chip size="2" tone="info">Running</Chip>
      <Chip size="2" tone="success">Deployed</Chip>
      <Chip size="2" tone="warning">Needs review</Chip>
      <Chip size="2" tone="destructive">Failed</Chip>
      <Chip size="2" tone="accent">New</Chip>
    </Flex>
  );
}
