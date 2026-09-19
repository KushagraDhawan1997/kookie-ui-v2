import { CodeBlock, Stack } from "@kookie-ui/react";

const SOURCE = `const invoice = await billing.createInvoice({
  customer: "cus_4821",
  currency: "eur",
});`;

// One `size` sets the padding, the corner and the text together.
export default function Example() {
  return (
    <Stack gap="5">
      <CodeBlock size="1">{SOURCE}</CodeBlock>
      <CodeBlock size="2">{SOURCE}</CodeBlock>
      <CodeBlock size="3">{SOURCE}</CodeBlock>
      <CodeBlock size="4">{SOURCE}</CodeBlock>
    </Stack>
  );
}
