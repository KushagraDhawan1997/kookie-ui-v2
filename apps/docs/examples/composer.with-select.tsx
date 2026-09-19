import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUp02Icon, Attachment01Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  Composer,
  ComposerInput,
  ComposerRow,
  ComposerSend,
  Flex,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  iconStroke,
} from "@kookie-ui/react";

const MODELS = { opus: "Opus 5", sonnet: "Sonnet 5", haiku: "Haiku 5" };

const icon = (glyph: typeof ArrowUp02Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

// Any control fits in the row. The composer's `size` reaches every
// control in it, so the Select, the Buttons and the text move together.
export default function Example() {
  return (
    <Composer size="3">
      <ComposerInput aria-label="Message" placeholder="Draft a release note…" />
      <ComposerRow>
        <Flex gap="2">
          <Button iconOnly aria-label="Add attachment">
            {icon(Attachment01Icon)}
          </Button>
          <Select defaultValue="opus" items={MODELS}>
            <SelectTrigger aria-label="Model" />
            <SelectContent>
              {Object.entries(MODELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Flex>
        <ComposerSend icons={{ ready: icon(ArrowUp02Icon) }} />
      </ComposerRow>
    </Composer>
  );
}
