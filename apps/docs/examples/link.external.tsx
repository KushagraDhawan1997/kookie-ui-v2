import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { Link, Text, iconStroke } from "@kookie-ui/react";

// For a page on another site, pass an anchor with `target` and `rel` through `render`.
// Link adds the type, the underline and the states. The anchor keeps its own attributes.
export default function Example() {
  return (
    <Text size="3" render={<p />} style={{ maxWidth: "28rem" }}>
      Card payments go through{" "}
      <Link render={<a href="https://stripe.com" target="_blank" rel="noreferrer" />}>
        Stripe
        <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={iconStroke} size="1em" aria-hidden />
      </Link>
      . We never store the card number.
    </Text>
  );
}
