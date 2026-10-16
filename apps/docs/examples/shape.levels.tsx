import {
  Button,
  Checkbox,
  Flex,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  Text,
  TextField,
  Theme,
} from "@kushagradhawan/kookie-ui-react";

const LEVELS = ["none", "small", "medium", "large", "full"] as const;

// Each row sets a different `radius` on a nested Theme. The radio and the switch stay round at
// `none`, and the checkbox stops short of a circle at `full`.
export default function Example() {
  return (
    <Stack gap="5" style={{ minWidth: "18rem" }}>
      {LEVELS.map((radius) => (
        <Theme key={radius} radius={radius}>
          <Flex gap="3" align="center" wrap="wrap">
            <Text size="2" emphasis="medium">
              {radius}
            </Text>
            <Button emphasis="loud">Save</Button>
            <TextField placeholder="Name" aria-label={`Name, ${radius}`} />
            <Checkbox defaultChecked aria-label={`Checkbox, ${radius}`} />
            <RadioGroup defaultValue="on" aria-label={`Radio, ${radius}`}>
              <Radio value="on" aria-label={`Option, ${radius}`} />
            </RadioGroup>
            <Switch defaultChecked aria-label={`Switch, ${radius}`} />
          </Flex>
        </Theme>
      ))}
    </Stack>
  );
}
