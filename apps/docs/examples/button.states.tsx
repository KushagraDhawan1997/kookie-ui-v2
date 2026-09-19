import { HugeiconsIcon } from "@hugeicons/react";
import { Upload01Icon } from "@hugeicons/core-free-icons";
import { Button, Flex, iconStroke } from "@kookie-ui/react";

export default function Example() {
  return (
    <Flex gap="3" align="center" wrap="wrap">
      <Button emphasis="loud" loading>
        Saving changes
      </Button>
      <Button loading leading={<HugeiconsIcon icon={Upload01Icon} strokeWidth={iconStroke} aria-hidden />}>
        Uploading
      </Button>
      <Button disabled>Archive project</Button>
      <Button emphasis="quiet" disabled>
        Undo
      </Button>
    </Flex>
  );
}
