import { Button, Flex } from "@kookie-ui/react";

export default function Example({
  gap = "4",
  direction = "row",
  align = "center",
  justify = "flex-start",
}: {
  gap?: string;
  direction?: "row" | "column";
  align?: "flex-start" | "center" | "flex-end" | "stretch" | "baseline";
  justify?: "flex-start" | "center" | "flex-end" | "space-between";
}) {
  return (
    <Flex gap={gap} direction={direction} align={align} justify={justify}>
      <Button size="2">One</Button>
      <Button size="2">Two</Button>
      <Button size="2">Three</Button>
    </Flex>
  );
}
