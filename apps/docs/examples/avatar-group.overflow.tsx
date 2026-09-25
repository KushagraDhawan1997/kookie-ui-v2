import { Avatar, AvatarGroup } from "@kushagradhawan/kookie-ui-react";

const members = [
  { name: "Shruti Bhatia", initials: "SB" },
  { name: "Kabir Das", initials: "KD" },
  { name: "Anaya Rao", initials: "AR" },
  { name: "Meera Iyer", initials: "MI" },
  { name: "Rohan Gupta", initials: "RG" },
  { name: "Tara Nair", initials: "TN" },
];

const shown = 3;

// The group has no maximum. Decide how many faces to show, and add one more Avatar whose
// fallback counts the rest. Its `alt` says the count in words.
export default function Example() {
  const rest = members.length - shown;
  return (
    <AvatarGroup size="4">
      {members.slice(0, shown).map((member) => (
        <Avatar key={member.name} alt={member.name} fallback={member.initials} />
      ))}
      <Avatar alt={`${rest} more members`} fallback={`+${rest}`} />
    </AvatarGroup>
  );
}
