import { Card, Flex, ScrollArea, Stack, Text } from "@kookie-ui/react";

const MEMBERS = [
  ["Shruti Bhatia", "Owner"],
  ["Design team", "Editor"],
  ["Marketing", "Viewer"],
  ["Support", "Viewer"],
  ["Finance", "Viewer"],
  ["Engineering", "Editor"],
  ["Contractors", "Viewer"],
  ["Legal", "Viewer"],
];

// When a ScrollArea is the only child of a Card, it reaches the card's edges and puts the
// card's padding inside itself. The bar then runs along the card's own edge.
export default function Example() {
  return (
    <Card style={{ width: "20rem" }}>
      <ScrollArea aria-label="Members" style={{ maxHeight: "14rem" }}>
        <Stack gap="4">
          {MEMBERS.map(([name, role]) => (
            <Flex key={name} justify="space-between">
              <Text size="2">{name}</Text>
              <Text size="2" emphasis="medium">
                {role}
              </Text>
            </Flex>
          ))}
        </Stack>
      </ScrollArea>
    </Card>
  );
}
