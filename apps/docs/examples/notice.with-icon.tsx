import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, InformationCircleIcon, WifiDisconnected01Icon } from "@hugeicons/core-free-icons";
import { Notice, Stack, iconStroke } from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof Alert02Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

export default function Example() {
  return (
    <Stack gap="3" style={{ maxWidth: "36rem" }}>
      <Notice tone="info" icon={icon(InformationCircleIcon)}>
        Scheduled maintenance runs on Sunday between 02:00 and 03:00 UTC.
      </Notice>
      <Notice tone="warning" icon={icon(Alert02Icon)}>
        This workspace is at 92% of its storage quota.
      </Notice>
      <Notice icon={icon(WifiDisconnected01Icon)}>
        You are offline. Changes save on this device until you reconnect.
      </Notice>
    </Stack>
  );
}
