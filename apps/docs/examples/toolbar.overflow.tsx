import { HugeiconsIcon } from "@hugeicons/react";
import {
  Copy01Icon,
  Delete02Icon,
  Download01Icon,
  LockIcon,
  Share08Icon,
} from "@hugeicons/core-free-icons";
import {
  Toolbar,
  ToolbarButton,
  ToolbarOverflow,
  ToolbarTitle,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof LockIcon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

export default function Example() {
  return (
    <Toolbar aria-label="File tools" style={{ width: "18rem" }}>
      <ToolbarTitle>Annual report.pdf</ToolbarTitle>
      <ToolbarOverflow label="More file actions">
        <ToolbarButton iconOnly aria-label="Share">
          {icon(Share08Icon)}
        </ToolbarButton>
        <ToolbarButton iconOnly aria-label="Download">
          {icon(Download01Icon)}
        </ToolbarButton>
        <ToolbarButton iconOnly aria-label="Duplicate">
          {icon(Copy01Icon)}
        </ToolbarButton>
        <ToolbarButton iconOnly aria-label="Lock">
          {icon(LockIcon)}
        </ToolbarButton>
        <ToolbarButton iconOnly tone="destructive" aria-label="Delete">
          {icon(Delete02Icon)}
        </ToolbarButton>
      </ToolbarOverflow>
    </Toolbar>
  );
}
