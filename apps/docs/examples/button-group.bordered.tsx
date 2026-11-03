import { HugeiconsIcon } from "@hugeicons/react";
import { CopyPlusIcon, Download01Icon, Share08Icon } from "@hugeicons/core-free-icons";
import { Button, ButtonGroup, iconStroke } from "@kushagradhawan/kookie-ui-react";

export default function Example() {
  return (
    <ButtonGroup aria-label="File actions">
      <Button
        emphasis="quiet"
        bordered
        leading={<HugeiconsIcon icon={Download01Icon} strokeWidth={iconStroke} aria-hidden />}
      >
        Download
      </Button>
      <Button
        emphasis="quiet"
        bordered
        leading={<HugeiconsIcon icon={CopyPlusIcon} strokeWidth={iconStroke} aria-hidden />}
      >
        Duplicate
      </Button>
      <Button
        emphasis="quiet"
        bordered
        leading={<HugeiconsIcon icon={Share08Icon} strokeWidth={iconStroke} aria-hidden />}
      >
        Share
      </Button>
    </ButtonGroup>
  );
}
