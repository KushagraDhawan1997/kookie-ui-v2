import { Badge, Box, Flex, Text, Tree, type TreeNode } from "@kookie-ui/react";

const label = (name: string, count: number) => (
  <Flex gap="2" align="center" justify="space-between" style={{ width: "100%" }}>
    <Text>{name}</Text>
    <Badge>{count}</Badge>
  </Flex>
);

const inbox: readonly TreeNode[] = [
  {
    id: "inbox",
    label: label("Inbox", 12),
    textValue: "Inbox",
    children: [
      { id: "billing", label: label("Billing", 3), textValue: "Billing" },
      { id: "support", label: label("Support", 9), textValue: "Support" },
    ],
  },
  { id: "archive", label: label("Archive", 240), textValue: "Archive" },
];

export default function Example() {
  return (
    <Box style={{ minWidth: "20rem" }}>
      <Tree items={inbox} defaultExpandedIds={["inbox"]} aria-label="Mailboxes" />
    </Box>
  );
}
