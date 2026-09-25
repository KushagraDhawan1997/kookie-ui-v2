import { Box, Button, Field, FieldLabel, Flex, Grid, Stack, TextField } from "@kushagradhawan/kookie-ui-react";

// Two columns for short fields that belong together. The address spans both,
// and the grid drops to one column when the container is narrow.
export default function Example() {
  return (
    <Stack gap="5" style={{ maxWidth: "32rem" }}>
      <Grid gap="4" columns={{ initial: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" }}>
        <Field>
          <FieldLabel>First name</FieldLabel>
          <TextField defaultValue="Shruti" />
        </Field>
        <Field>
          <FieldLabel>Last name</FieldLabel>
          <TextField defaultValue="Bhatia" />
        </Field>
        <Box gridArea={{ initial: "auto", sm: "auto / span 2" }}>
          <Field>
            <FieldLabel>Billing address</FieldLabel>
            <TextField placeholder="Street and number" />
          </Field>
        </Box>
        <Field>
          <FieldLabel>City</FieldLabel>
          <TextField />
        </Field>
        <Field>
          <FieldLabel>Postal code</FieldLabel>
          <TextField />
        </Field>
      </Grid>
      <Flex justify="flex-end">
        <Button emphasis="loud">Save address</Button>
      </Flex>
    </Stack>
  );
}
