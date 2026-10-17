import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger, Button, Flex, Stack, Tabs, TabsList, TabsPanel, TabsTab } from "@kushagradhawan/kookie-ui-react";

// The alert is a screen of its own, and its action rests loud. The two tab panels each hold
// one loud button, and only one panel shows at a time, so the page never shows two.
export default function App() {
  return (
    <Stack gap="6">
      <Flex gap="3">
        <Button emphasis="medium">Save draft</Button>
        <Button emphasis="medium">Publish</Button>
      </Flex>
      <AlertDialog>
        <AlertDialogTrigger render={<Button tone="destructive" emphasis="quiet">Delete</Button>} />
        <AlertDialogContent>
          <AlertDialogTitle>Delete this post?</AlertDialogTitle>
          <AlertDialogDescription>It cannot be restored.</AlertDialogDescription>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction tone="destructive">Delete post</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTab value="a">A</TabsTab>
          <TabsTab value="b">B</TabsTab>
        </TabsList>
        <TabsPanel value="a"><Button emphasis="loud">Run A</Button></TabsPanel>
        <TabsPanel value="b"><Button emphasis="loud">Run B</Button></TabsPanel>
      </Tabs>
    </Stack>
  );
}
