import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
  Card,
  Heading,
  Stack,
} from "@kookie-ui/react";

// The accordion draws no box of its own. Put it in a Card when the sections need an edge.
export default function Example() {
  return (
    <Card style={{ width: "26rem", maxWidth: "100%" }}>
      <Stack gap="3">
        <Heading size="5">Frequently asked questions</Heading>
        <Accordion>
          <AccordionItem value="cancel">
            <AccordionTrigger>Can I cancel at any time?</AccordionTrigger>
            <AccordionPanel>Yes. Your plan stays active until the end of the billing period.</AccordionPanel>
          </AccordionItem>
          <AccordionItem value="invoices">
            <AccordionTrigger>Where do I find my invoices?</AccordionTrigger>
            <AccordionPanel>Open Settings, then Billing. Each invoice downloads as a PDF.</AccordionPanel>
          </AccordionItem>
          <AccordionItem value="seats">
            <AccordionTrigger>How do I add seats?</AccordionTrigger>
            <AccordionPanel>Invite a person from Members. The next invoice includes the new seat.</AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Stack>
    </Card>
  );
}
