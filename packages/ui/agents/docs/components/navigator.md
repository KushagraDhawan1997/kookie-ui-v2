# Navigator

Navigator is a stack of screens: any screen can open another on top of it, and Back returns to the one below.

Job: Go. Move to another place in the app. A pattern: it owns the decisions this job needs.

```tsx
<Navigator
  root={<NavigatorScreen title="Settings">…</NavigatorScreen>}
  screen={(v) => <NavigatorScreen title={v}>…</NavigatorScreen>}
/>
```

## Overview

Use a Navigator when people go deeper into something and come back, such as from settings to notifications to email. It can hold any number of levels. The first screen is the root, and it never closes.

The screens above the root are a list of values that you can control with `path` and `onPathChange`. `screen` turns each value into its screen. Because the path is data, your app can keep it in the URL or open several levels deep at once.

A Navigator has no box of its own, so it is the page system for whatever holds it. In a `Shell` pane each screen is a `Page`, with a large title that moves into the pane's header as it scrolls away. In a dialog, a sheet or a titled popover, each screen shows one row with Back, the panel's own title and Close. A popover closes on any press outside it, so keep a flow of several steps in a dialog or a sheet. Don't put a Navigator inside a `Page`.

Open a screen with a `NavigatorLink`, or call `push` from `useNavigator`. Back closes the top screen and isn't shown on the root. The screens underneath stay open but hidden, so a list keeps its scroll position and a field keeps what you typed.

When a screen opens, focus moves to its title. When you go back, focus returns to the control that opened it. Escape closes whatever holds the Navigator, such as a dialog, and never goes back one screen.

## Not supported

- A Navigator inside a Page — A Navigator is the page system for its region, so inside a Page it would put a second page title on the screen. Put the Navigator in a dialog or a sheet instead.
- A Navigator inside another Navigator in the same region — Two navigators in one region would show two bars with two Back buttons.
- Escape to go back — Escape closes the dialog or sheet that holds the Navigator. Going back is the Back button.
- A disabled Back on the root — There is nowhere to go back to, so the button isn't shown.
- A URL — Kookie has no router. Keep the path in your URL yourself with `path` and `onPathChange`.

## Examples

```tsx
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
```

### In a pane

Put the Navigator straight in a `Shell` pane and it draws the pane's header, with Back and the title together, and the scroller for the screens. In a side pane the screen's title stays in the header. In the main content area each screen is a page, with a large title that moves into the header as you scroll.

```tsx
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
```

## Topics

Every symbol this component exports, grouped by the job it does. Each one carries the props it declares.

### Holding the screens

#### Navigator

Navigator is a stack of screens: any screen can open another on top of it, and Back returns to the one below.

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The frame around the screens, when you need your own: a band with actions, and a scroller holding `NavigatorOutlet`. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `defaultPath?` | `readonly T[]` | The path to start with when the navigator controls its own path. |
| `onPathChange?` | `(path: T[]) => void` | Called with the new path whenever a screen opens or closes. |
| `path?` | `readonly T[]` | The screens above the root, as values. |
| `root` | `React.ReactNode` | The root screen, usually a `NavigatorScreen`. |
| `screen` | `(value: T) => React.ReactNode` | Turns a value from the path into its screen, usually a `NavigatorScreen`. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

#### NavigatorScreen

One screen, with its `title`. In a pane it is a Page, and elsewhere it shows a row with Back and a small heading

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The screen's content, under its title. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `title` | `string` | The screen's title. |

### Going deeper and back

#### NavigatorLink

A row that opens the next screen when pressed. It pushes its `value` onto the path and shows a chevron

| Prop | Type | What it does |
| --- | --- | --- |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `current?` | `boolean` | Marks the row as the current location, such as the page you are on or the open file. |
| `disabled?` | `boolean` | Disables the row. |
| `highlighted?` | `boolean` | Highlights the row from your code. |
| `leading?` | `React.ReactNode` | Content before the label, such as an icon, an avatar or a tick. |
| `render?` | `RenderElement` | Renders the row as a different element. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | Sets the height of the row. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |
| `tone?` | `"neutral" \| "accent" \| "destructive" \| "blue" \| "green" \| "orange" \| "amber" \| "success" \| "warning" \| "info"` | Sets the colour family of the row. |
| `value` | `T` | The value pushed onto the path when the row is pressed. |

It also takes every prop of a `<button>`.

#### NavigatorBack

The Back button for a toolbar. It names the screen it returns to and isn't shown on the root

| Prop | Type | What it does |
| --- | --- | --- |
| `aria-label?` | `string` | The accessible name. |

### In a frame

#### NavigatorOutlet

Where the screens go when you pass a frame, such as a pane's header and scroller, as the navigator's children

It declares no props of its own. What it takes arrives from a shared type or from the primitive it is built on.
