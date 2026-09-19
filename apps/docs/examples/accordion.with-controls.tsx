import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
  Button,
  Field,
  FieldDescription,
  FieldLabel,
  Stack,
  TextField,
} from "@kookie-ui/react";

// A panel holds any content: text, a form, a list. The words of plain text start under the
// heading's label. A `Text` or a layout inside the panel sets its own size.
export default function Example() {
  return (
    <Accordion defaultValue={["domain"]} style={{ minWidth: "24rem" }}>
      <AccordionItem value="domain">
        <AccordionTrigger>Custom domain</AccordionTrigger>
        <AccordionPanel>
          <Stack gap="4">
            <Field>
              <FieldLabel>Domain</FieldLabel>
              <TextField placeholder="docs.example.com" />
              <FieldDescription>Point a CNAME record at your project first.</FieldDescription>
            </Field>
            <Stack align="start">
              <Button emphasis="medium">Verify domain</Button>
            </Stack>
          </Stack>
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="redirects">
        <AccordionTrigger>Redirects</AccordionTrigger>
        <AccordionPanel>No redirects yet.</AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
