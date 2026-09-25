import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button, Flex, iconStroke } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <Flex gap="3" align="center" wrap="wrap">
      <Button
        emphasis="loud"
        render={<a href="#billing" />}
        trailing={<HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={iconStroke} aria-hidden />}
      >
        Go to billing
      </Button>
      <Button emphasis="quiet" render={<a href="#help" />}>
        Read the guide
      </Button>
    </Flex>
  );
}
