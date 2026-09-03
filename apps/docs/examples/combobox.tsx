import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@kookie-ui/react";
import type { Size } from "@kookie-ui/react";

type Country = { value: string; label: string };

const COUNTRIES: Country[] = [
  { value: "ar", label: "Argentina" },
  { value: "au", label: "Australia" },
  { value: "br", label: "Brazil" },
  { value: "ca", label: "Canada" },
  { value: "de", label: "Germany" },
  { value: "in", label: "India" },
  { value: "jp", label: "Japan" },
  { value: "ke", label: "Kenya" },
  { value: "mx", label: "Mexico" },
  { value: "nl", label: "Netherlands" },
  { value: "pt", label: "Portugal" },
  { value: "za", label: "South Africa" },
];

export default function Example({ size = "2" }: { size?: Size }) {
  return (
    <Combobox size={size} items={COUNTRIES} name="country">
      <ComboboxInput aria-label="Country" placeholder="Search countries" />
      <ComboboxContent>
        <ComboboxEmpty>No country matches.</ComboboxEmpty>
        <ComboboxList>
          {(country: Country) => (
            <ComboboxItem key={country.value} value={country}>
              {country.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
