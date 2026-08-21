"use client";

import { Card, Flex, Grid, Radio, RadioGroup, Stack, Surface, Text } from "@kookie-ui/react";

export default function Example() {
  return (
    <Surface size="3">
      <RadioGroup defaultValue="pro" aria-label="Plan">
        <Grid columns="repeat(3, minmax(0, 1fr))" gapX="4" gapY="4">
          {(
            [
              ["starter", "Starter", "$0", "Three projects."],
              ["pro", "Pro", "$20", "Unlimited projects."],
              ["scale", "Scale", "$99", "SSO and an audit log."],
            ] as const
          ).map(([value, label, price, body]) => (
            <Card key={value} size="3" render={<label />}>
              <Stack gap="3">
                <Flex justify="space-between" align="center">
                  <Text size="3" weight="medium">
                    {label}
                  </Text>
                  <Radio value={value} />
                </Flex>
                <Text size="5">{price}</Text>
                <Text size="2" emphasis="medium">
                  {body}
                </Text>
              </Stack>
            </Card>
          ))}
        </Grid>
      </RadioGroup>
    </Surface>
  );
}
