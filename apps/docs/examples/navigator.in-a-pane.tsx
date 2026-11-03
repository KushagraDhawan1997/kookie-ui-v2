"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CreditCardIcon,
  Notification02Icon,
  Settings02Icon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import {
  Box,
  Button,
  Card,
  Chip,
  Field,
  FieldDescription,
  FieldLabel,
  Flex,
  Grid,
  Navigator,
  NavigatorScreen,
  NumberField,
  Radio,
  RadioGroup,
  SegmentedControl,
  SegmentedItem,
  Shell,
  ShellContent,
  ShellNavGroup,
  ShellNavItem,
  ShellSidebar,
  Stack,
  Text,
  TextField,
  iconStroke,
  useNavigator,
} from "@kushagradhawan/kookie-ui-react";

/* Placeholder plans for Kookie Studio. Not real pricing. */
type PlanId = "free" | "pro" | "team";
type Period = "monthly" | "yearly";
const PLANS: Record<PlanId, { name: string; monthly: number; yearly: number; for: string }> = {
  free: { name: "Free", monthly: 0, yearly: 0, for: "3 projects" },
  pro: { name: "Pro", monthly: 15, yearly: 12, for: "Unlimited" },
  team: { name: "Team", monthly: 30, yearly: 24, for: "Shared libraries" },
};

type Step = "plans" | "details" | "payment";
type Order = { plan: PlanId | null; period: Period; editors: number; current: PlanId };

const OrderContext = React.createContext<{ order: Order; set: (patch: Partial<Order>) => void } | null>(null);
const useOrder = () => React.use(OrderContext)!;

const icon = (glyph: typeof Settings02Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

/** The column a settings page reads in, so a wide window doesn't stretch the form. */
function Column({ children }: { children: React.ReactNode }) {
  return <Stack gap="6" style={{ maxWidth: "30rem" }}>{children}</Stack>;
}

/** The root: the current plan, and the way into changing it. */
function Billing() {
  const { order } = useOrder();
  const nav = useNavigator<Step>();
  const plan = PLANS[order.current];
  return (
    <NavigatorScreen title="Billing">
      <Column>
        <Card>
          <Stack gap="4">
            <Stack gap="1">
              <Flex gap="2" align="center">
                <Text weight="medium">{plan.name}</Text>
                <Chip>Current</Chip>
              </Flex>
              <Text size="2" emphasis="medium">
                {plan.for}
              </Text>
            </Stack>
            <Button emphasis="loud" onClick={() => nav.push("plans")}>
              Change plan
            </Button>
          </Stack>
        </Card>
      </Column>
    </NavigatorScreen>
  );
}

function Plans() {
  const { order, set } = useOrder();
  const nav = useNavigator<Step>();
  return (
    <NavigatorScreen title="Choose a plan">
      <Column>
        <SegmentedControl
          value={order.period}
          onValueChange={(value) => set({ period: value as Period })}
          aria-label="Billing period"
        >
          <SegmentedItem value="monthly">Monthly</SegmentedItem>
          <SegmentedItem value="yearly">Yearly</SegmentedItem>
        </SegmentedControl>
        <RadioGroup value={order.plan ?? ""} onValueChange={(value) => set({ plan: value as PlanId })} aria-label="Plan">
          <Stack gap="3">
            {/* The plans you can move to. The one you're on is on the Billing page. */}
            {(["pro", "team"] as const).map((id) => {
              const plan = PLANS[id];
              return (
                <Card key={id} render={<label />}>
                  <Flex gap="3" align="center">
                    <Radio value={id} />
                    <Stack gap="1" flexGrow="1">
                      <Text weight="medium">{plan.name}</Text>
                      <Text size="2" emphasis="medium">
                        {plan.for}
                      </Text>
                    </Stack>
                    <Stack gap="1" align="end">
                      <Text size="6" weight="medium">
                        ${plan[order.period]}
                      </Text>
                      <Text size="2" emphasis="medium">
                        per editor / month
                      </Text>
                    </Stack>
                  </Flex>
                </Card>
              );
            })}
          </Stack>
        </RadioGroup>
        <Button emphasis="loud" disabled={!order.plan} onClick={() => nav.push("details")}>
          Continue
        </Button>
      </Column>
    </NavigatorScreen>
  );
}

function Details() {
  const { order, set } = useOrder();
  const nav = useNavigator<Step>();
  const total = (order.plan ? PLANS[order.plan][order.period] : 0) * order.editors * (order.period === "yearly" ? 12 : 1);
  return (
    <NavigatorScreen title={`${order.plan ? PLANS[order.plan].name : ""} plan`}>
      <Column>
        <Field>
          <FieldLabel>Editors</FieldLabel>
          <NumberField value={order.editors} min={1} onValueChange={(value) => set({ editors: value ?? 1 })} style={{ maxWidth: "10rem" }} />
          <FieldDescription>You can add or remove editors later.</FieldDescription>
        </Field>
        <Flex justify="space-between" align="baseline" gap="4">
          <Text weight="medium">Billed {order.period === "yearly" ? "yearly" : "monthly"}, plus tax</Text>
          <Text weight="medium">
            ${total} / {order.period === "yearly" ? "year" : "month"}
          </Text>
        </Flex>
        <Button emphasis="loud" onClick={() => nav.push("payment")}>
          Continue to payment
        </Button>
      </Column>
    </NavigatorScreen>
  );
}

function Payment() {
  const { order, set } = useOrder();
  const nav = useNavigator<Step>();
  const total = (order.plan ? PLANS[order.plan][order.period] : 0) * order.editors * (order.period === "yearly" ? 12 : 1);
  return (
    <NavigatorScreen title="Payment">
      <Column>
        <Stack gap="5">
          <Field>
            <FieldLabel>Card number</FieldLabel>
            <TextField autoComplete="cc-number" />
          </Field>
          <Grid columns="1fr 1fr" gap="3">
            <Field>
              <FieldLabel>Expiry (MM/YY)</FieldLabel>
              <TextField autoComplete="cc-exp" />
            </Field>
            <Field>
              <FieldLabel>CVC</FieldLabel>
              <TextField autoComplete="cc-csc" />
            </Field>
          </Grid>
        </Stack>
        {/* A finished purchase goes back to Billing, now showing the new plan. */}
        <Button
          emphasis="loud"
          onClick={() => {
            if (order.plan) set({ current: order.plan, plan: null });
            nav.popTo(0);
          }}
        >
          Subscribe for ${total}
        </Button>
      </Column>
    </NavigatorScreen>
  );
}

const SCREENS: Record<Step, () => React.ReactElement> = { plans: Plans, details: Details, payment: Payment };

/** Kookie Studio's settings: the sections in the sidebar, and Billing in the main pane, where
 *  each step of changing the plan is a page of its own. */
export default function Example() {
  const [order, setOrder] = React.useState<Order>({ plan: null, period: "yearly", editors: 1, current: "free" });
  const context = React.useMemo(
    () => ({ order, set: (patch: Partial<Order>) => setOrder((previous) => ({ ...previous, ...patch })) }),
    [order],
  );
  return (
    /* The shape of the thing it runs in (FIGURES.md): a settings window, slightly wider than
       tall like macOS System Settings, with a settings sidebar's usual width. */
    <Box m="bleed" flexGrow="1" style={{ aspectRatio: "11 / 10" }}>
      <Shell contained style={{ "--shell-sidebar-w": "11rem" } as React.CSSProperties}>
        <ShellSidebar aria-label="Settings" defaultOpen presentation="fixed">
          <ShellNavGroup label="Settings">
            <ShellNavItem leading={icon(Settings02Icon)}>General</ShellNavItem>
            <ShellNavItem leading={icon(UserMultiple02Icon)}>Members</ShellNavItem>
            <ShellNavItem current leading={icon(CreditCardIcon)}>
              Billing
            </ShellNavItem>
            <ShellNavItem leading={icon(Notification02Icon)}>Notifications</ShellNavItem>
          </ShellNavGroup>
        </ShellSidebar>
        <ShellContent>
          <OrderContext.Provider value={context}>
            <Navigator<Step> root={<Billing />} screen={(step) => {
              const Screen = SCREENS[step];
              return <Screen />;
            }} />
          </OrderContext.Provider>
        </ShellContent>
      </Shell>
    </Box>
  );
}
