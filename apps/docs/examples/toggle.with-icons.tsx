import { HugeiconsIcon } from "@hugeicons/react";
import { FilterIcon, StarIcon } from "@hugeicons/core-free-icons";
import { Flex, Toggle, iconStroke } from "@kookie-ui/react";

export default function Example() {
  return (
    <Flex gap="2" wrap="wrap">
      <Toggle
        defaultPressed
        leading={<HugeiconsIcon icon={StarIcon} strokeWidth={iconStroke} aria-hidden />}
      >
        Starred only
      </Toggle>
      <Toggle leading={<HugeiconsIcon icon={FilterIcon} strokeWidth={iconStroke} aria-hidden />}>
        Show filters
      </Toggle>
    </Flex>
  );
}
