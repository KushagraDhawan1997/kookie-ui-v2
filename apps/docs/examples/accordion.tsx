import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@kookie-ui/react";
import type { Size } from "@kookie-ui/react";

export default function Example({
  size = "2",
  multiple = false,
}: {
  size?: Size;
  multiple?: boolean;
}) {
  return (
    <Accordion size={size} multiple={multiple} defaultValue={["shipping"]}>
      <AccordionItem value="shipping">
        <AccordionTrigger>Shipping</AccordionTrigger>
        <AccordionPanel>Orders ship within two business days. Tracking arrives by email.</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="returns">
        <AccordionTrigger>Returns</AccordionTrigger>
        <AccordionPanel>Thirty days from delivery, in the original packaging.</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="warranty">
        <AccordionTrigger>Warranty</AccordionTrigger>
        <AccordionPanel>Two years on every part, covering defects and not wear.</AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
