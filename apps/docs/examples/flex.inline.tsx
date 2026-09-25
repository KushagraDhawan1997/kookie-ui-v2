import { HugeiconsIcon } from "@hugeicons/react";
import { Clock01Icon } from "@hugeicons/core-free-icons";
import { Flex, Text, iconStroke } from "@kushagradhawan/kookie-ui-react";

// `display="inline-flex"` lets the Flex sit inside a line of text, so an
// icon and its words can flow with a sentence.
export default function Example() {
  return (
    <Text>
      The report runs every Monday at{" "}
      <Flex display="inline-flex" align="center" gap="1" render={<span />}>
        <HugeiconsIcon icon={Clock01Icon} strokeWidth={iconStroke} size="1em" aria-hidden />
        09:00 IST
      </Flex>
      , and Shruti Bhatia gets a copy.
    </Text>
  );
}
