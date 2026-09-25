"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon } from "@hugeicons/core-free-icons";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  Text,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const MEMBERS = ["Shruti Bhatia", "Design team", "Engineering team", "Finance team", "Support team"];

// `leading` puts an icon before the text. The chevron always sits at the
// trailing edge, so there is no `trailing` slot.
export default function Example() {
  return (
    <Combobox items={MEMBERS}>
      <ComboboxInput
        placeholder="Assign to"
        aria-label="Assignee"
        leading={<HugeiconsIcon icon={UserIcon} strokeWidth={iconStroke} aria-hidden />}
        style={{ maxWidth: "22rem" }}
      />
      <ComboboxContent>
        <ComboboxEmpty>
          <Text size="2">Nobody by that name.</Text>
        </ComboboxEmpty>
        <ComboboxList>
          {(member: string) => (
            <ComboboxItem key={member} value={member}>
              {member}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
