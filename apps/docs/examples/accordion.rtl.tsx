import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@kookie-ui/react";

// `dir` is the platform's attribute, not a prop this component
// invented: put it here or on any ancestor and the chevron turns
// and the panel's inset mirrors. Most apps state it once, high up.
export default function Example() {
  return (
    <Accordion dir="rtl" defaultValue={["shipping"]}>
      <AccordionItem value="shipping">
        <AccordionTrigger>Shipping</AccordionTrigger>
        <AccordionPanel>
          Orders ship within two business days.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="returns">
        <AccordionTrigger>Returns</AccordionTrigger>
        <AccordionPanel>Thirty days to return.</AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
