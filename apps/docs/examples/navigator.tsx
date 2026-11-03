"use client";

import * as React from "react";
import {
  Button,
  Card,
  Chip,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
  Field,
  FieldDescription,
  FieldLabel,
  Flex,
  Grid,
  Navigator,
  NavigatorScreen,
  Notice,
  NumberField,
  Radio,
  RadioGroup,
  SegmentedControl,
  SegmentedItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Separator,
  Stack,
  Text,
  TextField,
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

type Step = "details" | "payment" | "review";
type Order = { plan: PlanId | null; period: Period; editors: number; card: string };

const OrderContext = React.createContext<{
  order: Order;
  set: (patch: Partial<Order>) => void;
  subscribe: () => void;
} | null>(null);
const useOrder = () => React.use(OrderContext)!;

const total = (order: Order) =>
  (order.plan ? PLANS[order.plan][order.period] : 0) * order.editors * (order.period === "yearly" ? 12 : 1);
const per = (order: Order) => (order.period === "yearly" ? "year" : "month");

/** A label and its value on one baseline, the value at the end. */
function Line({ label, value, strong }: { label: string; value: React.ReactNode; strong?: boolean }) {
  return (
    <Flex justify="space-between" align="baseline" gap="4">
      <Text {...(strong ? { weight: "medium" as const } : { emphasis: "medium" as const })}>{label}</Text>
      <Text {...(strong ? { weight: "medium" as const } : {})}>{value}</Text>
    </Flex>
  );
}

/** One action per screen, at the end. */
function Actions({ children }: { children: React.ReactNode }) {
  return <Stack>{children}</Stack>;
}

function ChoosePlan() {
  const { order, set } = useOrder();
  const nav = useNavigator<Step>();
  return (
    <NavigatorScreen title="Choose a plan">
      <Stack gap="6">
        <SegmentedControl
          value={order.period}
          onValueChange={(value) => set({ period: value as Period })}
          aria-label="Billing period"
        >
          <SegmentedItem value="monthly">Monthly</SegmentedItem>
          <SegmentedItem value="yearly">Yearly</SegmentedItem>
        </SegmentedControl>
        <RadioGroup value={order.plan ?? ""} onValueChange={(value) => set({ plan: value as PlanId })} aria-label="Plan">
          <Grid columns="repeat(3, minmax(0, 1fr))" gap="3">
            {(Object.keys(PLANS) as PlanId[]).map((id) => {
              const plan = PLANS[id];
              const current = id === "free";
              return (
                <Card key={id} render={<label />}>
                  <Stack gap="4">
                    <Radio value={id} disabled={current} />
                    <Stack gap="1">
                      <Flex gap="2" align="center">
                        <Text weight="medium">{plan.name}</Text>
                        {current ? <Chip>Current</Chip> : null}
                      </Flex>
                      <Text size="6" weight="medium">
                        ${plan[order.period]}
                      </Text>
                      <Text size="2" emphasis="medium">
                        {plan.for}
                      </Text>
                    </Stack>
                  </Stack>
                </Card>
              );
            })}
          </Grid>
        </RadioGroup>
        <Text size="2" emphasis="medium">
          Per editor, per month, in USD plus tax.
        </Text>
        <Actions>
          <Button emphasis="loud" disabled={!order.plan} onClick={() => nav.push("details")}>
            Continue
          </Button>
        </Actions>
      </Stack>
    </NavigatorScreen>
  );
}

function Details() {
  const { order, set } = useOrder();
  const nav = useNavigator<Step>();
  return (
    <NavigatorScreen title={`${order.plan ? PLANS[order.plan].name : ""} plan`}>
      <Stack gap="6">
        <Field>
          <FieldLabel>Editors</FieldLabel>
          <NumberField value={order.editors} min={1} onValueChange={(value) => set({ editors: value ?? 1 })} style={{ maxWidth: "10rem" }} />
          <FieldDescription>You can add or remove editors later.</FieldDescription>
        </Field>
        <Line
          label={`Billed ${order.period === "yearly" ? "yearly" : "monthly"}`}
          value={`$${total(order)} / ${per(order)}`}
          strong
        />
        <Actions>
          <Button emphasis="loud" onClick={() => nav.push("payment")}>
            Continue to payment
          </Button>
        </Actions>
      </Stack>
    </NavigatorScreen>
  );
}

function Payment() {
  const { order, set } = useOrder();
  const nav = useNavigator<Step>();
  const [declined, setDeclined] = React.useState(false);
  return (
    <NavigatorScreen title="Payment">
      <Stack gap="6">
        {declined ? (
          <Notice tone="destructive">Your card was declined. Try another card or contact your bank.</Notice>
        ) : null}
        <Stack gap="5">
          <Field>
            <FieldLabel>Card number</FieldLabel>
            <TextField
              value={order.card}
              onChange={(event) => set({ card: event.target.value })}
              autoComplete="cc-number"
            />
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
          <Field>
            <FieldLabel>Country</FieldLabel>
            <Select defaultValue="us" items={{ us: "United States", gb: "United Kingdom", in: "India" }}>
              <SelectTrigger />
              <SelectContent>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="gb">United Kingdom</SelectItem>
                <SelectItem value="in">India</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </Stack>
        <Actions>
          <Button
            emphasis="loud"
            onClick={() => {
              const declines = order.card.replace(/\s/g, "") === "4000000000000002";
              setDeclined(declines);
              if (!declines) nav.push("review");
            }}
          >
            Review order
          </Button>
        </Actions>
      </Stack>
    </NavigatorScreen>
  );
}

function Review() {
  const { order, subscribe } = useOrder();
  const [busy, setBusy] = React.useState(false);
  const last4 = order.card.replace(/\s/g, "").slice(-4) || "4242";
  return (
    <NavigatorScreen title="Review">
      <Stack gap="6">
        <Stack gap="3">
          <Line label="Plan" value={order.plan ? PLANS[order.plan].name : ""} />
          <Line label="Editors" value={order.editors} />
          <Line label="Card" value={`Ending ${last4}`} />
          <Separator />
          <Line label="Due today, plus tax" value={`$${total(order)}`} strong />
        </Stack>
        <Text size="2" emphasis="medium">
          Renews every {per(order)} until you cancel in Settings.
        </Text>
        <Actions>
          <Button
            emphasis="loud"
            loading={busy}
            onClick={() => {
              setBusy(true);
              setTimeout(subscribe, 900);
            }}
          >
            Subscribe for ${total(order)}
          </Button>
        </Actions>
      </Stack>
    </NavigatorScreen>
  );
}

/** The finished purchase replaces the stack, so there is no Back from it. */
function Success() {
  const { order } = useOrder();
  return (
    <NavigatorScreen title={`You're on ${order.plan ? PLANS[order.plan].name : ""}`}>
      <Stack gap="6">
        <Text emphasis="medium">The receipt is in your email.</Text>
        <Actions>
          <DialogClose render={<Button emphasis="loud">Done</Button>} />
        </Actions>
      </Stack>
    </NavigatorScreen>
  );
}

const SCREENS: Record<Step, () => React.ReactElement> = { details: Details, payment: Payment, review: Review };

export default function Example() {
  const [order, setOrder] = React.useState<Order>({ plan: null, period: "yearly", editors: 1, card: "" });
  const [path, setPath] = React.useState<Step[]>([]);
  const [done, setDone] = React.useState(false);
  const context = React.useMemo(
    () => ({
      order,
      set: (patch: Partial<Order>) => setOrder((previous) => ({ ...previous, ...patch })),
      subscribe: () => {
        setPath([]);
        setDone(true);
      },
    }),
    [order],
  );

  return (
    <Dialog
      size="3"
      onOpenChange={(open) => {
        if (open) return;
        setPath([]);
        setDone(false);
      }}
    >
      <DialogTrigger render={<Button emphasis="loud">Upgrade</Button>} />
      <DialogContent>
        <OrderContext.Provider value={context}>
          <Navigator
            path={path}
            onPathChange={setPath}
            root={done ? <Success /> : <ChoosePlan />}
            screen={(step) => {
              const Screen = SCREENS[step];
              return <Screen />;
            }}
          />
        </OrderContext.Provider>
      </DialogContent>
    </Dialog>
  );
}
