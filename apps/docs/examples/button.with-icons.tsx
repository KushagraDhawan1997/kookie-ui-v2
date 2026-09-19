import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, ArrowDown01Icon, Download01Icon } from "@hugeicons/core-free-icons";
import { Button, Flex, iconStroke } from "@kookie-ui/react";

export default function Example() {
  return (
    <Flex gap="3" align="center" wrap="wrap">
      <Button emphasis="loud" leading={<HugeiconsIcon icon={Add01Icon} strokeWidth={iconStroke} aria-hidden />}>
        New project
      </Button>
      <Button leading={<HugeiconsIcon icon={Download01Icon} strokeWidth={iconStroke} aria-hidden />}>
        Export CSV
      </Button>
      <Button
        emphasis="quiet"
        trailing={<HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={iconStroke} aria-hidden />}
      >
        Sort by date
      </Button>
    </Flex>
  );
}
