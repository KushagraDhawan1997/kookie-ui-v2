import { HugeiconsIcon } from "@hugeicons/react";
import { Clock01Icon, Comment01Icon, ListViewIcon } from "@hugeicons/core-free-icons";
import { Stack, Toggle, ToggleGroup, iconStroke } from "@kookie-ui/react";

export default function Example() {
  return (
    <ToggleGroup
      aria-label="Panels"
      orientation="vertical"
      defaultValue={["outline"]}
      render={<Stack gap="1" align="start" />}
    >
      <Toggle value="outline" leading={<HugeiconsIcon icon={ListViewIcon} strokeWidth={iconStroke} aria-hidden />}>
        Outline
      </Toggle>
      <Toggle value="comments" leading={<HugeiconsIcon icon={Comment01Icon} strokeWidth={iconStroke} aria-hidden />}>
        Comments
      </Toggle>
      <Toggle value="history" leading={<HugeiconsIcon icon={Clock01Icon} strokeWidth={iconStroke} aria-hidden />}>
        History
      </Toggle>
    </ToggleGroup>
  );
}
