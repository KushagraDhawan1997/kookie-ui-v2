import { HugeiconsIcon } from "@hugeicons/react";
import { Mail01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { Field, FieldLabel, Kbd, Stack, TextField, iconStroke } from "@kookie-ui/react";

export default function Example() {
  return (
    <Stack gap="5" style={{ maxWidth: "22rem" }}>
      <TextField
        type="search"
        placeholder="Search projects"
        aria-label="Search projects"
        leading={<HugeiconsIcon icon={Search01Icon} strokeWidth={iconStroke} aria-hidden />}
        trailing={<Kbd>⌘K</Kbd>}
      />
      <Field>
        <FieldLabel>Billing email</FieldLabel>
        <TextField
          type="email"
          placeholder="shruti@example.com"
          leading={<HugeiconsIcon icon={Mail01Icon} strokeWidth={iconStroke} aria-hidden />}
        />
      </Field>
      <Field>
        <FieldLabel>Workspace address</FieldLabel>
        <TextField defaultValue="design-team" trailing=".kookie.app" />
      </Field>
    </Stack>
  );
}
