import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger, Text } from "@kookie-ui/react";
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
        <AccordionPanel>
          <Text size="2" emphasis="medium">
            Orders ship within two business days. Tracking arrives by email.
          </Text>
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="returns">
        <AccordionTrigger>Returns</AccordionTrigger>
        <AccordionPanel>
          <Text size="2" emphasis="medium">
            Thirty days from delivery, in the original packaging.
          </Text>
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="warranty">
        <AccordionTrigger>Warranty</AccordionTrigger>
        <AccordionPanel>
          <Text size="2" emphasis="medium">
            Two years on every part, covering defects and not wear.
          </Text>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
