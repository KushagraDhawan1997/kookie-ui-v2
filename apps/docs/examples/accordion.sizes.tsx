import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
  Stack,
} from "@kookie-ui/react";

const sizes = ["1", "2", "3", "4"] as const;

// `size` on the root sets every heading and panel inside it. Each heading stands as tall as a
// Button at the same size.
export default function Example() {
  return (
    <Stack gap="6" style={{ minWidth: "22rem" }}>
      {sizes.map((size) => (
        <Accordion key={size} size={size} defaultValue={["plan"]}>
          <AccordionItem value="plan">
            <AccordionTrigger>Plan and billing</AccordionTrigger>
            <AccordionPanel>You are on the Team plan, billed every month.</AccordionPanel>
          </AccordionItem>
          <AccordionItem value="seats">
            <AccordionTrigger>Seats</AccordionTrigger>
            <AccordionPanel>Eight of ten seats are in use.</AccordionPanel>
          </AccordionItem>
        </Accordion>
      ))}
    </Stack>
  );
}
