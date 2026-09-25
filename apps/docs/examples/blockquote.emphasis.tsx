import { Blockquote, Stack } from "@kushagradhawan/kookie-ui-react";

// `emphasis` picks the ink colour. A quote rests at `loud`, like all body text. Use `medium`
// for a quote that supports the text around it. Keep `quiet` for text people can skip.
export default function Example() {
  return (
    <Stack gap="5" style={{ maxWidth: "32rem" }}>
      <Blockquote emphasis="loud">
        We moved every project to the Team plan in one afternoon.
      </Blockquote>
      <Blockquote emphasis="medium">
        We moved every project to the Team plan in one afternoon.
      </Blockquote>
    </Stack>
  );
}
