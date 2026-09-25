import { Blockquote, Stack } from "@kushagradhawan/kookie-ui-react";

const sizes = ["2", "3", "4", "5"] as const;

// `size` is a step on the type scale, as on Text. It defaults to 3. The indent grows with the
// text, so the words stay clear of the rule at every size.
export default function Example() {
  return (
    <Stack gap="5" style={{ maxWidth: "32rem" }}>
      {sizes.map((size) => (
        <Blockquote key={size} size={size}>
          Ship the smallest change that answers the question, then look at it before you add more.
        </Blockquote>
      ))}
    </Stack>
  );
}
