import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, Download01Icon, Share01Icon } from "@hugeicons/core-free-icons";
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
        leading={<HugeiconsIcon icon={Copy01Icon} strokeWidth={iconStroke} aria-hidden />}
      >
        Duplicate
      </Button>
      <Button
        emphasis="quiet"
        bordered
        leading={<HugeiconsIcon icon={Share01Icon} strokeWidth={iconStroke} aria-hidden />}
      >
        Share
      </Button>
    </ButtonGroup>
  );
}
