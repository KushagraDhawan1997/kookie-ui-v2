"use client";

/**
 * The showcase — whole screens, at the top of the playground, before the first component
 * section (2026-08-09, Kushagra: "I'm not seeing real examples, what a real consumer will
 * use", and the refusal of a second route: "preview without examples doesn't make sense").
 *
 * What it is for, precisely. The specimen tables below answer "is this cell right": one
 * component, every axis crossed, nothing else in the frame. They cannot answer the question
 * that actually decides whether the system is any good — does a heading, a field, a hairline,
 * a switch and two buttons, put in one box by an ordinary consumer, read as one designed
 * thing. Every fault in the confirm card that started this (a 12px body under a 14px title,
 * size-1 buttons in a size-3 card, a full-width rule over a right-aligned pair) is invisible
 * in a matrix and obvious here.
 *
 * Rules these fragments hold themselves to, so that when one looks wrong the system is what
 * is wrong:
 *
 * 1. Ordinary call sites only. No colour is picked, no length is invented, nothing reaches
 *    past a prop the package ships. Where a fragment needs a distance it uses a layout Stack's
 *    gap, and where it needs a width it states one on a Box — the two escapes §3 sanctions.
 * 2. The house style is DECISIONS §15's, not this file's — read it there. What it means here:
 *    five steps and only five — page 8, section 7, card title 6, body 3, label and meta 2 — so
 *    a card title sits 1.5x over its own body and the page sits 2.5x over that. Size 1 is not
 *    used: 12px is for genuinely marginal text, and "less important" is what the muted and
 *    faint ink roles are for. Three passes got this ladder wrong before it was written down.
 * 2b. No eyebrows, and no run-up headings. A title says what the thing is in as few words as
 *    carry it — "Notifications", not "Preferences" over "Notifications." (2026-08-09, Kushagra,
 *    reversing the eyebrow the same day it landed: it came off a reference sheet rather than
 *    out of this system, and it is two elements doing one element's job.)
 * 2c. Nothing is bold. Semibold tops the ladder (§15) — headings say "heading" by size and the
 *    ink roles, never by weight.
 * 3. Real words. "Delete workspace" and "acme-production", never "Label" and "Item one".
 */
import * as React from "react";
import {
  Box,
  Button,
  Card,
  Checkbox,
  Code,
  Flex,
  Grid,
  Heading,
  Kbd,
  Menu,
  MenuContent,
  MenuItem,
  MenuGroup,
  MenuLabel,
  MenuTrigger,
  Progress,
  Radio,
  RadioGroup,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  Separator,
  Slider,
  Spinner,
  Stack,
  Switch,
  Text,
  TextArea,
  TextField,
  windowClassQueries,
} from "@kookie-ui/react";

import {
  ArrowUpIcon,
  BellIcon,
  ChartIcon,
  FolderIcon,
  HomeIcon,
  LockIcon,
  MailIcon,
  MoreIcon,
  PaperclipIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
} from "../icons";

/* ── Shared shapes ─────────────────────────────────────────────────────────────────────── */

/** A labelled control. The label is a real `<label>` wearing Text's dress — the association
    is markup, not colour, and 8px is the distance every field in every fragment uses. */
function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <Stack gap="3">
      <Text size="2" weight="medium" render={<label htmlFor={htmlFor} />}>
        {label}
      </Text>
      {children}
      {hint ? <Text size="2" emphasis="quiet">{hint}</Text> : null}
    </Stack>
  );
}

/**
 * A card's own header — DECISIONS §15 "Composition: the house style" made concrete.
 *
 * Title at size 6 against a size-3 body: 24 over 16, a 1.5x jump. It has been size 3 over
 * size 2 (1.14x, a rounding error) and then size 5 over size 2; the third pass is the one that
 * moved the BODY too, because the floor of this ladder is 16px and not 14 (Kushagra,
 * 2026-08-09: "still feels too small, the type I mean, even body").
 *
 * There is no eyebrow. It shipped for exactly one commit and was refused: a title carries its
 * own subject, and a size-1 label above it is a second element doing the first one's job.
 *
 * The gap under the title is tight and the gap under the whole header is generous — space
 * around a heading is asymmetric, because a heading belongs to what follows it.
 */
function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <Flex justify="space-between" align="flex-start" gap="4">
      <Stack gap="2">
        <Heading size="6" render={<h3 />} style={{ textWrap: "balance" }}>
          {title}
        </Heading>
        {description ? <Text emphasis="medium">{description}</Text> : null}
      </Stack>
      {action}
    </Flex>
  );
}

/** A meta row: a fact about the thing, label left and value right, divided by a hairline from
    the row above it. The references put every fact here rather than into the prose. */
function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Stack gap="4">
      <Separator />
      <Flex justify="space-between" align="baseline" gap="4">
        <Text size="2" weight="medium">
          {label}
        </Text>
        <Text size="2" emphasis="medium">
          {children}
        </Text>
      </Flex>
    </Stack>
  );
}

/** A settings row: the thing being switched on the left, the control on the right. The
    label is the switch's own `<label>`, so the words are part of the target. */
function SettingRow({
  id,
  label,
  description,
  children,
}: {
  id: string;
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Flex justify="space-between" align="center" gap="5">
      <Stack gap="1">
        <Text weight="medium" render={<label htmlFor={id} />}>
          {label}
        </Text>
        <Text size="2" emphasis="medium">
          {description}
        </Text>
      </Stack>
      {children}
    </Flex>
  );
}

const rowMenu = (
  <>
    <MenuGroup>
      <MenuLabel>Member</MenuLabel>
      <MenuItem>View profile</MenuItem>
      <MenuItem>Change role…</MenuItem>
      <MenuItem>Resend invite</MenuItem>
    </MenuGroup>
    <Separator />
    <MenuItem tone="destructive">Remove from workspace</MenuItem>
  </>
);

/* ── Fragments ─────────────────────────────────────────────────────────────────────────── */

/** Sign in — the smallest complete screen a product has, and the one that shows whether a
    field, a checkbox and two stacked buttons agree about weight. */
function SignIn() {
  return (
    <Card size="4">
      <Stack gap="6">
        <CardHeader
          title="Sign in"
          description="Use your work account. Single sign-on is available on Scale."
        />
        <Stack gap="5">
          <Field label="Email" htmlFor="sc-email">
            <TextField
              id="sc-email"
              type="email"
              placeholder="you@company.com"
              leading={<MailIcon />}
            />
          </Field>
          <Field label="Password" htmlFor="sc-password">
            <TextField
              id="sc-password"
              type="password"
              defaultValue="correct horse"
              leading={<LockIcon />}
            />
          </Field>
        </Stack>
        <Flex justify="space-between" align="center" gap="4">
          <Flex gap="3" align="center">
            <Checkbox id="sc-remember" defaultChecked />
            <Text render={<label htmlFor="sc-remember" />}>Keep me signed in</Text>
          </Flex>
          <Button emphasis="quiet" render={<a href="#showcase" />}>
            Forgot password?
          </Button>
        </Flex>
        {/* Stack items stretch, so these are full-width without a width being stated —
            the layout does it, the button has no opinion about how wide it is. */}
        <Stack gap="3">
          <Button tone="accent" emphasis="loud">
            Sign in
          </Button>
          <Button emphasis="quiet" bordered>
            Continue with SSO
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}

/** The confirm card, rebuilt (2026-08-09). What it looked like before is the reason this
    file exists: the rule ran the full width of the card under a right-aligned pair, and the
    buttons were two sizes below their own card. There is no hairline now — the distance is
    the separation, which is what a Stack gap is for. */
function ConfirmDelete() {
  return (
    <Card size="4">
      <Stack gap="6">
        <Stack gap="2">
          <Heading size="6" render={<h3 />} style={{ textWrap: "balance" }}>
            Delete workspace
          </Heading>
          {/* The name moved out of the sentence and into the label: a Code chip mid-paragraph
              breaks across lines like any other word, and "acme-" over "production" reads as
              a rendering fault. A chip belongs where it cannot be broken. */}
          <Text emphasis="medium">
            Every project, member, and API key goes with it. This cannot be undone.
          </Text>
        </Stack>
        <Field label="Type acme-production to confirm" htmlFor="sc-confirm">
          <TextField id="sc-confirm" placeholder="acme-production" />
        </Field>
        <Flex gap="3" justify="flex-end">
          <Button emphasis="quiet" bordered>
            Keep it
          </Button>
          <Button tone="destructive" emphasis="loud">
            Delete workspace
          </Button>
        </Flex>
      </Stack>
    </Card>
  );
}

/** Notification settings — four switches and a select, the shape every app has, and the
    only place in the playground where a stack of switch rows can be judged as a stack. */
function Notifications() {
  return (
    <Card size="4">
      <Stack gap="6">
        <CardHeader
          title="Notifications"
          description="Choose what reaches you, and where."
          action={
            <Button emphasis="quiet" iconOnly aria-label="Notification history">
              <BellIcon />
            </Button>
          }
        />
        <Stack gap="5">
          <SettingRow
            id="sc-n-mentions"
            label="Mentions"
            description="Someone names you in a comment."
          >
            <Switch id="sc-n-mentions" defaultChecked />
          </SettingRow>
          <SettingRow
            id="sc-n-deploys"
            label="Deploys"
            description="Production builds that fail."
          >
            <Switch id="sc-n-deploys" defaultChecked />
          </SettingRow>
          <SettingRow id="sc-n-weekly" label="Weekly digest" description="Monday, 9am local.">
            <Switch id="sc-n-weekly" />
          </SettingRow>
          <SettingRow
            id="sc-n-marketing"
            label="Product news"
            description="Managed by your workspace owner."
          >
            <Switch id="sc-n-marketing" disabled />
          </SettingRow>
        </Stack>
        <Separator />
        <Field label="Deliver to" htmlFor="sc-n-channel">
          <Select
            defaultValue="email"
            items={{ email: "Email", slack: "Slack", both: "Email and Slack" }}
          >
            <SelectTrigger id="sc-n-channel" placeholder="Pick a channel" />
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="slack">Slack</SelectItem>
              <SelectItem value="both">Email and Slack</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </Stack>
    </Card>
  );
}

/** A deploy in flight — heading, code, bar, caption, actions. The one fragment where the
    progress bar has neighbours to be wrong beside. */
function DeployStatus() {
  return (
    <Card size="4">
      <Stack gap="6">
        <CardHeader
          title="Production deploy"
          action={
            <Menu>
              <MenuTrigger
                render={
                  <Button emphasis="quiet" iconOnly aria-label="Deploy actions">
                    <MoreIcon />
                  </Button>
                }
              />
              <MenuContent align="end">
                <MenuItem>Copy deploy URL</MenuItem>
                <MenuItem>Redeploy</MenuItem>
                <MenuItem>Promote to production</MenuItem>
                <Separator />
                <MenuItem tone="destructive">Cancel deploy</MenuItem>
              </MenuContent>
            </Menu>
          }
        />
        <Flex gap="3" align="center">
          <Spinner />
          <Text emphasis="medium">
            Building <Code>main@50ba95b</Code>
          </Text>
        </Flex>
        <Stack gap="3">
          <Flex justify="space-between" align="baseline">
            <Text weight="medium">14 of 23 packages</Text>
            <Text emphasis="medium">62%</Text>
          </Flex>
          <Progress value={62} aria-label="Build progress" />
        </Stack>
        {/* Facts about the deploy live in labelled rows on hairlines, not in a prose caption
            under the bar — the reference set's own arrangement (§15 house style, rule 5). */}
        <Stack gap="4">
          <MetaRow label="Commit">
            <Code size="2">50ba95b</Code>
          </MetaRow>
          <MetaRow label="Branch">main</MetaRow>
          <MetaRow label="Remaining">about 2 minutes</MetaRow>
        </Stack>
        <Flex gap="3">
          <Button emphasis="medium">View logs</Button>
          <Button emphasis="quiet" bordered>
            Cancel
          </Button>
        </Flex>
      </Stack>
    </Card>
  );
}

/** New project — the long form. Field, select, textarea and a footer pair, which is where a
    field family that does not agree with itself shows up immediately. */
function NewProject() {
  return (
    <Card size="4">
      <Stack gap="6">
        <CardHeader
          title="New project"
          description="Projects hold deploys, domains and keys."
        />
        <Stack gap="5">
          <Field label="Name" htmlFor="sc-p-name">
            <TextField id="sc-p-name" defaultValue="acme-production" />
          </Field>
          <Field
            label="Visibility"
            htmlFor="sc-p-visibility"
            hint="Private projects are visible to workspace members only."
          >
            <Select
              defaultValue="private"
              items={{ private: "Private", team: "Team", public: "Public" }}
            >
              <SelectTrigger id="sc-p-visibility" placeholder="Choose" />
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Workspace</SelectLabel>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Anyone</SelectLabel>
                  <SelectItem value="public">Public</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Description" htmlFor="sc-p-description">
            <TextArea
              id="sc-p-description"
              rows={3}
              placeholder="What this project is for."
            />
          </Field>
        </Stack>
        <Flex gap="3" justify="flex-end">
          <Button emphasis="quiet" bordered>
            Cancel
          </Button>
          <Button tone="accent" emphasis="loud">
            Create project
          </Button>
        </Flex>
      </Stack>
    </Card>
  );
}

/** The plan picker — radios carrying prices, and a slider that has a number beside it. */
function PlanPicker() {
  const [seats, setSeats] = React.useState(12);
  return (
    <Card size="4">
      <Stack gap="6">
        <CardHeader
          title="Plan"
          description="Changes take effect on your next invoice."
        />
        <RadioGroup defaultValue="pro" aria-label="Plan">
          <Stack gap="5">
            {(
              [
                ["starter", "Starter", "Three projects, community support.", "Free"],
                ["pro", "Pro", "Unlimited projects, priority support.", "$20 / seat"],
                ["scale", "Scale", "SSO, audit log, dedicated region.", "$60 / seat"],
              ] as const
            ).map(([value, label, description, price]) => (
              <Flex key={value} gap="4" align="flex-start">
                <Radio value={value} id={`sc-plan-${value}`} />
                <Stack gap="1" flexGrow="1">
                  <Flex justify="space-between" gap="4">
                    <Text weight="medium" render={<label htmlFor={`sc-plan-${value}`} />}>
                      {label}
                    </Text>
                    <Text emphasis="medium">{price}</Text>
                  </Flex>
                  <Text size="2" emphasis="medium">
                    {description}
                  </Text>
                </Stack>
              </Flex>
            ))}
          </Stack>
        </RadioGroup>
        <Separator />
        {/* No `<label for>` here: a slider's labelable element is the hidden range input
            Base UI owns, which the call site cannot address. `aria-label` is the component's
            own documented answer, and the visible number is a readout beside it. */}
        <Stack gap="3">
          <Flex justify="space-between" align="baseline">
            <Text weight="medium">Seats</Text>
            <Text emphasis="medium">{seats}</Text>
          </Flex>
          <Slider
            value={seats}
            onValueChange={(value) => setSeats(Array.isArray(value) ? value[0]! : value)}
            min={1}
            max={50}
            aria-label="Seats"
          />
        </Stack>
        <Stack gap="4">
          <MetaRow label="Billed monthly">${seats * 20}</MetaRow>
          <MetaRow label="Renews">1 September</MetaRow>
        </Stack>
        <Button tone="accent" emphasis="loud">
          Update plan
        </Button>
      </Stack>
    </Card>
  );
}

/** A composer — a growing box, a small toolbar, and a send button with its shortcut. The
    fragment that judges whether a textarea and a row of icon buttons share a family. */
function Composer() {
  return (
    <Card size="4">
      <Stack gap="5">
        <CardHeader title="New message" description="Everyone in #engineering will see it." />
        <TextArea
          rows={3}
          aria-label="Message"
          defaultValue="Shipping the row family tonight — the menu rows and the select rows are one ladder now."
        />
        <Flex justify="space-between" align="center" gap="4">
          <Flex gap="1">
            <Button emphasis="quiet" iconOnly aria-label="Attach a file">
              <PaperclipIcon />
            </Button>
            <Button emphasis="quiet" iconOnly aria-label="Insert">
              <PlusIcon />
            </Button>
          </Flex>
          <Flex gap="3" align="center">
            <Text size="2" emphasis="quiet">
              <Kbd size="2">⌘</Kbd> <Kbd size="2">⏎</Kbd> to send
            </Text>
            <Button tone="accent" emphasis="loud" iconOnly aria-label="Send">
              <ArrowUpIcon />
            </Button>
          </Flex>
        </Flex>
      </Stack>
    </Card>
  );
}

/** The app shell — a sidebar of quiet buttons beside a toolbar and a list. This is the one
    fragment that is not a card in a column: it is what a page looks like, and it is where
    the row family, the field family and the mark family all sit in the same frame. */
function Workspace() {
  const members = [
    ["mira", "Mira Chen", "mira@kookie.dev", "Owner"],
    ["sol", "Sol Whitaker", "sol@kookie.dev", "Admin"],
    ["ada", "Ada Rowe", "ada@kookie.dev", "Member"],
    ["kit", "Kit Nakamura", "kit@kookie.dev", "Member"],
  ] as const;

  const nav = [
    ["Overview", <HomeIcon key="i" />, true],
    ["Projects", <FolderIcon key="i" />, false],
    ["Members", <UsersIcon key="i" />, false],
    ["Usage", <ChartIcon key="i" />, false],
    ["Settings", <SettingsIcon key="i" />, false],
  ] as const;

  return (
    <Card size="4">
      <Grid className="sc-shell" gapX="6" gapY="6" style={{ alignItems: "start" }}>
        {/* The sidebar: quiet buttons in a Stack, the selected one a rung up. Nothing here
            is a nav component — the system does not ship one, and this is what a consumer
            would reach for today, which is exactly what we need to look at. */}
        <Stack gap="1" render={<nav aria-label="Workspace" />}>
          {nav.map(([label, icon, current]) => (
            <Button
              key={label}
              emphasis={current ? "medium" : "quiet"}
              leading={icon}
              // A button centres its label; a nav row starts it. There is no alignment prop
              // and there should not be one on a button — this is a nav component's job, and
              // the system does not ship one yet. `style` is the sanctioned escape (§13), and
              // leaving it visible here is the point: it names a real gap.
              style={{ justifyContent: "flex-start" }}
              render={<a href="#showcase" aria-current={current ? "page" : undefined} />}
            >
              {label}
            </Button>
          ))}
        </Stack>

        <Stack gap="5" minWidth="0">
          <Flex justify="space-between" align="center" gap="4" wrap="wrap">
            <Box flexGrow="1" maxWidth="18rem" minWidth="12rem">
              <TextField placeholder="Search members" leading={<SearchIcon />} aria-label="Search members" />
            </Box>
            <Flex gap="3" align="center">
              <Select defaultValue="all" items={{ all: "All roles", admin: "Admins", member: "Members" }}>
                <SelectTrigger placeholder="Role" aria-label="Filter by role" />
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  <SelectItem value="member">Members</SelectItem>
                </SelectContent>
              </Select>
              <Button tone="accent" emphasis="loud" leading={<PlusIcon />}>
                Invite
              </Button>
            </Flex>
          </Flex>

          {/* A list, not a table: each row is padded by its own Box and the hairline between
              rows is the component that draws hairlines. */}
          <Box>
            {members.map(([id, name, email, role], i) => (
              <React.Fragment key={id}>
                {i === 0 ? null : <Separator />}
                <Box py="4">
                  <Flex align="center" gap="4">
                    <Checkbox id={`sc-m-${id}`} defaultChecked={i === 0} />
                    <Stack gap="1" flexGrow="1" minWidth="0">
                      <Text weight="medium" render={<label htmlFor={`sc-m-${id}`} />}>
                        {name}
                      </Text>
                      <Text size="2" emphasis="medium">
                        {email}
                      </Text>
                    </Stack>
                    <Text size="2" emphasis="quiet">
                      {role}
                    </Text>
                    <Menu>
                      <MenuTrigger
                        render={
                          <Button emphasis="quiet" iconOnly aria-label={`Actions for ${name}`}>
                            <MoreIcon />
                          </Button>
                        }
                      />
                      <MenuContent align="end">{rowMenu}</MenuContent>
                    </Menu>
                  </Flex>
                </Box>
              </React.Fragment>
            ))}
          </Box>

          <Flex justify="space-between" align="center" gap="4">
            <Text size="2" emphasis="quiet">
              4 of 12 members · 8 seats left
            </Text>
            <Button size="2" emphasis="quiet" bordered>
              Load more
            </Button>
          </Flex>
        </Stack>
      </Grid>
    </Card>
  );
}

/* ── Layout ────────────────────────────────────────────────────────────────────────────── */

/**
 * Two hand-placed columns, not `auto-fit`: which fragment sits beside which is a composition
 * decision, and a track count that changes with the container would shuffle them. Below the
 * system's own `narrow` boundary the grid is one column — the boundary is IMPORTED from the
 * package (§18), the same rule the panel's lane follows, so this page has one idea of narrow.
 *
 * The workspace shell spans the full lane above them, because it is a page rather than a card.
 */
const SHOWCASE_CSS = `
.sc-cols { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.sc-shell { grid-template-columns: 13rem minmax(0, 1fr); }
@media ${windowClassQueries.narrow} {
  .sc-cols, .sc-shell { grid-template-columns: minmax(0, 1fr); }
}
`;

export function Showcase() {
  return (
    <Stack gap="6" render={<section id="showcase" />}>
      <style>{SHOWCASE_CSS}</style>
      {/* Section title, then the paragraph. No eyebrow and no run-up: the title says what the
          section is, and space under it is tight while space above it is the page's own. */}
      <Stack gap="2">
        <Heading size="7" render={<h2 />} style={{ textWrap: "balance" }}>
          Real screens
        </Heading>
        <Text emphasis="medium" style={{ maxWidth: "36rem" }}>
          Ordinary call sites, composed the way a consumer would compose them. Move any axis in
          the panel and every screen here answers at once — this is where "does it look right
          beside the others" gets settled, and the tables below are where single cells do.
        </Text>
      </Stack>
      <Workspace />
      <Grid className="sc-cols" gapX="6" gapY="6" style={{ alignItems: "start" }}>
        {/* Balanced by height, not by category: two hand-placed columns only look composed if
            they end near each other, and the first arrangement left one of them 600px short. */}
        <Stack gap="6">
          <ConfirmDelete />
          <SignIn />
          <NewProject />
        </Stack>
        <Stack gap="6">
          <Notifications />
          <DeployStatus />
          <PlanPicker />
          <Composer />
        </Stack>
      </Grid>
    </Stack>
  );
}
