import { Heading, Stack } from "@kookie-ui/react";

// `size` picks a step on the same nine-step scale Text uses.
// The screen headings in this system use step 8 for a page, 7 for a section and 6 for a card.
export default function Example() {
  return (
    <Stack gap="3">
      <Heading size="8" render={<h2 />}>
        Billing
      </Heading>
      <Heading size="7" render={<h3 />}>
        Payment methods
      </Heading>
      <Heading size="6" render={<h4 />}>
        Company card
      </Heading>
      <Heading size="4" render={<h5 />}>
        Recent invoices
      </Heading>
    </Stack>
  );
}
