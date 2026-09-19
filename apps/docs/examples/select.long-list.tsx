import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@kookie-ui/react";

const ZONES = {
  Europe: ["London", "Paris", "Berlin", "Madrid", "Rome", "Stockholm", "Warsaw", "Athens"],
  Asia: ["Dubai", "Mumbai", "Singapore", "Tokyo", "Seoul", "Jakarta", "Manila"],
  Americas: ["New York", "Chicago", "Denver", "Los Angeles", "Toronto", "São Paulo"],
};

const LABELS = Object.fromEntries(Object.values(ZONES).flat().map((city) => [city, city]));

// A long list scrolls inside the panel. On open, the panel places the chosen option over
// the trigger, so you see it first.
export default function Example() {
  return (
    <Select defaultValue="Singapore" items={LABELS}>
      <SelectTrigger aria-label="Time zone" />
      <SelectContent>
        {Object.entries(ZONES).map(([region, cities]) => (
          <SelectGroup key={region}>
            <SelectLabel>{region}</SelectLabel>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
