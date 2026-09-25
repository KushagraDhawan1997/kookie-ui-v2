import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@kushagradhawan/kookie-ui-react";
import type { Size } from "@kushagradhawan/kookie-ui-react";

// `size` on the root sets every heading and panel inside it. Each heading stands as tall as a
// Button at the same size.
export default function Example({ size = "2" }: { size?: Size }) {
  return (
    <Accordion size={size} defaultValue={["plan"]} style={{ width: "22rem", maxWidth: "100%" }}>
      <AccordionItem value="plan">
        <AccordionTrigger>Plan and billing</AccordionTrigger>
        <AccordionPanel>You are on the Team plan, billed every month.</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="seats">
        <AccordionTrigger>Seats</AccordionTrigger>
        <AccordionPanel>Eight of ten seats are in use.</AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
