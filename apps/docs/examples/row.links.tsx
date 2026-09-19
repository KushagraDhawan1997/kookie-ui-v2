import { HugeiconsIcon } from "@hugeicons/react";
import { CreditCardIcon, Home01Icon, Settings01Icon, UserIcon } from "@hugeicons/core-free-icons";
import { Row, Stack, iconStroke } from "@kookie-ui/react";

const icon = (glyph: typeof Home01Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

const LINKS = [
  { href: "#overview", label: "Overview", glyph: Home01Icon },
  { href: "#members", label: "Members", glyph: UserIcon },
  { href: "#billing", label: "Billing", glyph: CreditCardIcon },
  { href: "#settings", label: "Settings", glyph: Settings01Icon },
];

export default function Example() {
  return (
    <Stack gap="1" style={{ minWidth: "16rem" }} render={<nav aria-label="Workspace" />}>
      {LINKS.map((link) => (
        <Row
          key={link.href}
          render={<a href={link.href} />}
          leading={icon(link.glyph)}
          current={link.label === "Billing"}
        >
          {link.label}
        </Row>
      ))}
    </Stack>
  );
}
