import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, Edit02Icon, Settings01Icon, Share01Icon } from "@hugeicons/core-free-icons";
import { Button, Flex, iconStroke } from "@kookie-ui/react";

export default function Example() {
  return (
    <Flex gap="2" align="center">
      <Button iconOnly emphasis="quiet" aria-label="Edit file">
        <HugeiconsIcon icon={Edit02Icon} strokeWidth={iconStroke} aria-hidden />
      </Button>
      <Button iconOnly emphasis="quiet" aria-label="Share file">
        <HugeiconsIcon icon={Share01Icon} strokeWidth={iconStroke} aria-hidden />
      </Button>
      <Button iconOnly aria-label="File settings">
        <HugeiconsIcon icon={Settings01Icon} strokeWidth={iconStroke} aria-hidden />
      </Button>
      <Button iconOnly tone="destructive" aria-label="Delete file">
        <HugeiconsIcon icon={Delete02Icon} strokeWidth={iconStroke} aria-hidden />
      </Button>
    </Flex>
  );
}
