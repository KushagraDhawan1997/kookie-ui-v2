import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@kookie-ui/react";

// `disabled` sits on the ITEM, not the root: one section can be
// closed to you while the rest of the list still opens.
export default function Example() {
  return (
    <Accordion defaultValue={["shipping"]}>
      <AccordionItem value="shipping">
        <AccordionTrigger>Shipping</AccordionTrigger>
        <AccordionPanel>
          Orders ship within two business days.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="returns" disabled>
        <AccordionTrigger>Returns</AccordionTrigger>
        <AccordionPanel>Thirty days from delivery.</AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
