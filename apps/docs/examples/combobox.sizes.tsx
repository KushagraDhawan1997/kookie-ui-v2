"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  Stack,
} from "@kookie-ui/react";

const LANGUAGES = ["English", "Deutsch", "Español", "Français", "हिन्दी", "日本語"];

// `size` sets the field, the panel, the rows and the text together. It
// matches a TextField or a Button at the same size.
export default function Example() {
  return (
    <Stack gap="4" style={{ maxWidth: "22rem" }}>
      {(["1", "2", "3", "4"] as const).map((size) => (
        <Combobox key={size} size={size} items={LANGUAGES} defaultValue="English">
          <ComboboxInput aria-label={`Language, size ${size}`} />
          <ComboboxContent>
            <ComboboxList>
              {(language: string) => (
                <ComboboxItem key={language} value={language}>
                  {language}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      ))}
    </Stack>
  );
}
