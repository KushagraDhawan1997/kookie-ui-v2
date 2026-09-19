import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@kookie-ui/react";

// With `multiple`, opening one section leaves the others open. `defaultValue` lists every
// section that starts open.
export default function Example() {
  return (
    <Accordion multiple defaultValue={["email", "push"]} style={{ minWidth: "22rem" }}>
      <AccordionItem value="email">
        <AccordionTrigger>Email</AccordionTrigger>
        <AccordionPanel>A daily summary of comments and mentions.</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="push">
        <AccordionTrigger>Push notifications</AccordionTrigger>
        <AccordionPanel>Direct mentions and review requests only.</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="sms">
        <AccordionTrigger>Text messages</AccordionTrigger>
        <AccordionPanel>Security alerts, such as a new sign-in.</AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
