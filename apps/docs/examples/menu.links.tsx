import { HugeiconsIcon } from "@hugeicons/react";
import { CreditCardIcon, Logout01Icon, Settings01Icon, UserIcon } from "@hugeicons/core-free-icons";
import {
  Button,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  Separator,
  iconStroke,
} from "@kookie-ui/react";

const icon = (glyph: typeof UserIcon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

// When a row goes to a page, render it as a link with `render`. The row stays
// one target. Pass your router's link component in the same way.
export default function Example() {
  return (
    <Menu>
      <MenuTrigger render={<Button>Shruti Bhatia</Button>} />
      <MenuContent>
        <MenuItem leading={icon(UserIcon)} render={<a href="#profile" />}>
          Profile
        </MenuItem>
        <MenuItem leading={icon(Settings01Icon)} render={<a href="#settings" />}>
          Settings
        </MenuItem>
        <MenuItem leading={icon(CreditCardIcon)} render={<a href="#billing" />}>
          Billing
        </MenuItem>
        <Separator />
        <MenuItem leading={icon(Logout01Icon)}>Sign out</MenuItem>
      </MenuContent>
    </Menu>
  );
}
