import { Link, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// A link uses the accent tone when you set nothing. Set `tone` when the
// destination has a meaning, such as a destructive action.
export default function Example() {
  return (
    <Stack gap="3" style={{ maxWidth: "28rem" }}>
      <Text size="3" render={<p />}>
        See <Link href="#usage">this month&apos;s usage</Link> for each project.
      </Text>
      <Text size="3" render={<p />}>
        To remove every project and member,{" "}
        <Link href="#delete" tone="destructive">
          delete this workspace
        </Link>
        .
      </Text>
      <Text size="3" render={<p />}>
        <Link href="#changelog" tone="neutral">
          Read the changelog
        </Link>{" "}
        for the full list of changes.
      </Text>
    </Stack>
  );
}
