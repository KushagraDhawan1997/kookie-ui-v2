import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUp02Icon, Attachment01Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  Composer,
  ComposerInput,
  ComposerRow,
  ComposerSend,
  iconStroke,
} from "@kookie-ui/react";

const icon = (glyph: typeof ArrowUp02Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

// Disable the input and each control. The text dims to the same colour a
// disabled TextArea uses. The box itself does not change.
export default function Example() {
  return (
    <Composer>
      <ComposerInput
        aria-label="Message"
        placeholder="This thread is archived"
        defaultValue="Thanks, that fixed the build."
        disabled
      />
      <ComposerRow>
        <Button iconOnly aria-label="Add attachment" disabled>
          {icon(Attachment01Icon)}
        </Button>
        <ComposerSend disabled icons={{ ready: icon(ArrowUp02Icon) }} />
      </ComposerRow>
    </Composer>
  );
}
