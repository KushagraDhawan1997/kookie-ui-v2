"use client";

import * as React from "react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  ArrowExpand01Icon,
  ArrowHorizontalIcon,
  CropIcon,
  Cursor01Icon,
  DiamondIcon,
  Film01Icon,
  Flag01Icon,
  Folder01Icon,
  Hold01Icon,
  MagnetIcon,
  MoreHorizontalIcon,
  MoveIcon,
  NextIcon,
  PlayIcon,
  PreviousIcon,
  RepeatIcon,
  Scissor01Icon,
  Search01Icon,
  Tick02Icon,
  SearchAddIcon,
  SearchMinusIcon,
  Share08Icon,
  SidebarLeftIcon,
  SidebarRightIcon,
  SortingIcon,
  SquareLock02Icon,
  SquareUnlock02Icon,
  ViewIcon,
  VolumeHighIcon,
  VolumeMute01Icon,
} from "@hugeicons/core-free-icons";
import {
  Box,
  Button,
  Flex,
  Grid,
  Chip,
  NumberField,
  NumberFieldGroup,
  SegmentedControl,
  SegmentedItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Separator,
  Shell,
  ShellBottom,
  ShellContent,
  ShellHeader,
  ShellInspector,
  ShellPaneHeader,
  ShellScroll,
  ShellSidebar,
  Slider,
  Stack,
  Switch,
  Text,
  TextField,
  Theme,
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarTitle,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

import { RedoIcon, UndoIcon } from "../icons";

import { ScrolledToEnd } from "./scrolled-to-end";

import "./editor-app.css";


const glyph = (icon: IconSvgElement) =>
  function Glyph() {
    return <HugeiconsIcon icon={icon} strokeWidth={iconStroke} aria-hidden />;
  };

const Icons = {
  Blade: glyph(Scissor01Icon),
  Crop: glyph(CropIcon),
  Expand: glyph(ArrowExpand01Icon),
  Event: glyph(Film01Icon),
  Hand: glyph(Hold01Icon),
  Inspector: glyph(SidebarRightIcon),
  Keyframe: glyph(DiamondIcon),
  Library: glyph(Folder01Icon),
  Lock: glyph(SquareLock02Icon),
  Loop: glyph(RepeatIcon),
  Magnet: glyph(MagnetIcon),
  Marker: glyph(Flag01Icon),
  Media: glyph(SidebarLeftIcon),
  More: glyph(MoreHorizontalIcon),
  Move: glyph(MoveIcon),
  Next: glyph(NextIcon),
  Play: glyph(PlayIcon),
  Previous: glyph(PreviousIcon),
  Search: glyph(Search01Icon),
  Tick: glyph(Tick02Icon),
  ZoomIn: glyph(SearchAddIcon),
  ZoomOut: glyph(SearchMinusIcon),
  Select: glyph(Cursor01Icon),
  Share: glyph(Share08Icon),
  Sort: glyph(SortingIcon),
  Speaker: glyph(VolumeHighIcon),
  Muted: glyph(VolumeMute01Icon),
  Trim: glyph(ArrowHorizontalIcon),
  Unlock: glyph(SquareUnlock02Icon),
  Visible: glyph(ViewIcon),
};

const EVENTS = [
  { name: "Shoot, old town", count: 24, current: true },
  { name: "Shoot, coast", count: 31 },
  { name: "Interviews", count: 9 },
  { name: "Music and sound", count: 14 },
];

/** Each clip's thumbnail is a frame from it: Valencia, the city and its coast (Unsplash).
 *  Cathedral is the selected clip, the frame in the viewer. */
const MEDIA = [
  { name: "City hall", time: "0:12", image: "city-hall" },
  { name: "Malvarrosa", time: "0:06", image: "malvarrosa" },
  { name: "Old town", time: "0:21", image: "old-town" },
  { name: "Orange grove", time: "0:09", image: "orange-grove" },
  { name: "Rooftops", time: "0:15", image: "rooftops" },
  { name: "Facades", time: "0:11", image: "facades" },
  { name: "Street", time: "0:08", image: "street" },
  { name: "Coast", time: "0:14", image: "coast" },
  { name: "White street", time: "0:17", image: "white-street" },
  { name: "Cathedral", time: "0:10", image: "cathedral" },
];

type Clip = { at: number; len: number; name: string; selected?: boolean };
type Track = { name: string; kind: "video" | "title" | "audio"; muted?: boolean; locked?: boolean; clips: Clip[] };
/** Clips as [start, length] in seconds of a 90s window. */
const TRACKS: Track[] = [
  { name: "Titles", kind: "title", clips: [{ at: 2, len: 8, name: "Valencia" }, { at: 70, len: 10, name: "Credits" }] },
  { name: "Captions", kind: "title", clips: [{ at: 14, len: 10, name: "Ciutat Vella" }, { at: 40, len: 10, name: "Malvarrosa" }, { at: 64, len: 9, name: "La Huerta" }] },
  { name: "Overlay", kind: "video", clips: [{ at: 20, len: 8, name: "Map" }, { at: 50, len: 6, name: "Callout" }] },
  { name: "B-roll", kind: "video", clips: [{ at: 24, len: 6, name: "Tram" }, { at: 55, len: 7, name: "Market" }] },
  {
    name: "Main",
    kind: "video",
    clips: [
      { at: 0, len: 12, name: "City hall" },
      { at: 12, len: 6, name: "Malvarrosa" },
      { at: 18, len: 21, name: "Cathedral", selected: true },
      { at: 39, len: 9, name: "Orange grove" },
      { at: 48, len: 15, name: "Rooftops" },
      { at: 63, len: 11, name: "Facades" },
      { at: 74, len: 16, name: "White street" },
    ],
  },
  { name: "Dialogue", kind: "audio", clips: [{ at: 4, len: 18, name: "Narration" }, { at: 63, len: 20, name: "Interview" }] },
  { name: "Room", kind: "audio", clips: [{ at: 0, len: 40, name: "City" }, { at: 44, len: 46, name: "Beach" }] },
  { name: "Effects", kind: "audio", muted: true, clips: [{ at: 30, len: 5, name: "Bells" }, { at: 40, len: 14, name: "Waves" }, { at: 58, len: 4, name: "Gulls" }] },
  { name: "Foley", kind: "audio", clips: [{ at: 10, len: 6, name: "Footsteps" }, { at: 33, len: 5, name: "Bicycle" }, { at: 70, len: 7, name: "Shutters" }] },
  { name: "Score", kind: "audio", locked: true, clips: [{ at: 0, len: 90, name: "Theme" }] },
];

const SPAN = 90;
const PLAYHEAD = 26;
const MARKERS = [12, 39, 63];

/** One labelled row in the inspector: the label at the controls' size, then its control(s). */
function Prop({ label, children, keyframe = true }: { label: string; children: React.ReactNode; keyframe?: boolean }) {
  return (
    <div className="kd-edit-prop">
      <Text size="2">{label}</Text>
      <div className="kd-edit-prop-value">{children}</div>
      {keyframe ? (
        <Button iconOnly emphasis="quiet" aria-label={`Keyframe ${label}`}>
          <Icons.Keyframe />
        </Button>
      ) : (
        <span />
      )}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Stack gap="3">
      <Text size="2" emphasis="medium">
        {title}
      </Text>
      {children}
    </Stack>
  );
}

/**
 * SERVE THE JOB, for the principles page (2026-11-05, Kushagra: "even in a dense user interface,
 * you can guide users well with design"; Final Cut and Runway as references; built for a 14" Mac;
 * "one loud action per area or region"; and "we must never hide items that are useful ... people
 * do real work, real serious work"). A video editor at a 14-inch screen's real size, with what a
 * real one carries: events and clips, a viewer with its zoom, quality, loop and in/out, a clip
 * inspector with tabs and keyframed rows, and a timeline with tools, markers, track headers that
 * show, mute and lock, waveforms and meters. Nothing is thinned for looks; the guiding is done by
 * rank: one loud action per region (Import in the library, Export in the project bar, Play in the
 * viewer, Add effect in the inspector), the selected clip as the
 * timeline's one strong mark, and everything else quiet. Every pane is glass at step 3. Pictures
 * are blank tiles until real ones exist.
 */
/** `timelineEnd` shows the timeline scrolled to its last layer, as in the figure's picture. */
export function EditorApp({ timelineEnd = false }: { timelineEnd?: boolean }) {
  return (
    <Shell contained size="2" className="kd-edit-shell">
      <ShellHeader>
        <Toolbar size="3">
          <Flex align="center" gap="2">
            <ToolbarButton iconOnly aria-label="Library">
              <Icons.Media />
            </ToolbarButton>
            <ToolbarTitle>Valencia</ToolbarTitle>
          </Flex>
          <Flex align="center" gap="2">
            <ToolbarGroup>
              <ToolbarButton iconOnly aria-label="Undo">
                <UndoIcon />
              </ToolbarButton>
              <ToolbarButton iconOnly aria-label="Redo">
                <RedoIcon />
              </ToolbarButton>
            </ToolbarGroup>
            <ToolbarButton iconOnly aria-label="Share">
              <Icons.Share />
            </ToolbarButton>
            <ToolbarButton emphasis="loud">Export</ToolbarButton>
            <ToolbarButton iconOnly aria-label="Inspector">
              <Icons.Inspector />
            </ToolbarButton>
          </Flex>
        </Toolbar>
      </ShellHeader>
      <ShellSidebar aria-label="Library" defaultOpen presentation="fixed" flush>
        {/* As in the inspector: the header floats in glass and the library scrolls and fades
            under it. */}
        <ShellPaneHeader float>
          <Toolbar size="3" backdrop>
            <ToolbarTitle>Library</ToolbarTitle>
            <Flex align="center" gap="2">
              <ToolbarButton iconOnly aria-label="Sort">
                <Icons.Sort />
              </ToolbarButton>
              <ToolbarButton emphasis="loud">Import</ToolbarButton>
            </Flex>
          </Toolbar>
        </ShellPaneHeader>
        <ShellScroll fade>
          <Stack gap="5" className="kd-edit-under-header">
            <TextField placeholder="Search clips" aria-label="Search clips" leading={<Icons.Search />} />
            <Stack gap="1">
              {EVENTS.map((event) => (
                <div key={event.name} className="kd-edit-event" data-current={event.current || undefined}>
                  <Icons.Event />
                  <Text size="2" className="kd-edit-grow">
                    {event.name}
                  </Text>
                  <Text size="2" emphasis="quiet">
                    {event.count}
                  </Text>
                </div>
              ))}
            </Stack>
            <Separator />
            <Stack gap="3">
              <Text size="2" emphasis="medium">
                Shoot, old town
              </Text>
              <SegmentedControl defaultValue="all" aria-label="Show" className="kd-edit-wide">
                <SegmentedItem value="all">All</SegmentedItem>
                <SegmentedItem value="video">Video</SegmentedItem>
                <SegmentedItem value="audio">Audio</SegmentedItem>
              </SegmentedControl>
            </Stack>
            <Grid columns="repeat(2, minmax(0, 1fr))" gap="4">
              {MEDIA.map((clip) => (
                <Stack key={clip.name} gap="1">
                  <div
                    className="kd-edit-thumb"
                    data-selected={clip.name === "Cathedral" || undefined}
                    style={{ backgroundImage: `url(/figures/editor/${clip.image}.webp)` }}
                  >
                    <Chip size="2" className="kd-edit-thumb-time">
                      {clip.time}
                    </Chip>
                  </div>
                  <Text size="2" className="kd-edit-clip-name">
                    {clip.name}
                  </Text>
                </Stack>
              ))}
            </Grid>
          </Stack>
        </ShellScroll>
      </ShellSidebar>
      <ShellContent>
        {/* `bleed` undoes the pane's padding, so the picture runs to the pane's edges. */}
        {/* Over a busy frame the viewer's controls are near solid glass, step 8, so they read on any
            footage (2026-11-05, Kushagra, on the cathedral frame). */}
        <Theme material="8" className="kd-edit-solid">
          <Box m="bleed" className="kd-edit-stage">
            {/* The picture fills the pane, and its two control rows float over it in glass: the one
                place in this window where content passes behind a control (2026-11-05, Kushagra:
                "If its flush, it can never be glass"). The panes are solid. */}
            <Toolbar size="3" backdrop aria-label="Viewer" className="kd-edit-over kd-edit-over-top">
              <Flex align="center" gap="2">
                <Select defaultValue="fit" items={{ fit: "Fit", "50": "50%", "100": "100%" }}>
                  <SelectTrigger aria-label="Viewer zoom" />
                  <SelectContent>
                    <SelectItem value="fit">Fit</SelectItem>
                    <SelectItem value="50">50%</SelectItem>
                    <SelectItem value="100">100%</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="best" items={{ best: "Best quality", fast: "Better performance" }}>
                  <SelectTrigger aria-label="Playback quality" />
                  <SelectContent>
                    <SelectItem value="best">Best quality</SelectItem>
                    <SelectItem value="fast">Better performance</SelectItem>
                  </SelectContent>
                </Select>
              </Flex>
              <Flex align="center" gap="2">
                <ToolbarButton iconOnly aria-label="Crop">
                  <Icons.Crop />
                </ToolbarButton>
                <ToolbarButton iconOnly aria-label="Transform">
                  <Icons.Move />
                </ToolbarButton>
              </Flex>
            </Toolbar>
            <div className="kd-edit-viewer" />
            {/* The times sit as glass chips just above the transport, centred on Play: the playhead's
                time, the In and Out points, and the clip's length. */}
            <Flex align="center" justify="center" gap="2" className="kd-edit-times">
              <Chip size="2" backdrop className="kd-edit-time">
                00:00:26:12
              </Chip>
              <Chip size="2" backdrop className="kd-edit-time">
                In 00:18
              </Chip>
              <Chip size="2" backdrop className="kd-edit-time">
                Out 00:39
              </Chip>
              <Chip size="2" backdrop className="kd-edit-time">
                00:01:30:00
              </Chip>
            </Flex>
            <Toolbar size="3" backdrop aria-label="Playback" className="kd-edit-transport kd-edit-over kd-edit-over-bottom">
              <span />
              <Flex align="center" gap="2">
                <ToolbarGroup>
                  <ToolbarButton iconOnly aria-label="Previous edit">
                    <Icons.Previous />
                  </ToolbarButton>
                  <ToolbarButton iconOnly emphasis="loud" aria-label="Play">
                    <Icons.Play />
                  </ToolbarButton>
                  <ToolbarButton iconOnly aria-label="Next edit">
                    <Icons.Next />
                  </ToolbarButton>
                </ToolbarGroup>
              </Flex>
              <Flex align="center" gap="2" justify="end">
                <ToolbarButton iconOnly aria-label="Loop">
                  <Icons.Loop />
                </ToolbarButton>
                <ToolbarButton iconOnly aria-label="Full screen">
                  <Icons.Expand />
                </ToolbarButton>
              </Flex>
            </Toolbar>
          </Box>
        </Theme>
      </ShellContent>
      <ShellInspector aria-label="Clip" defaultOpen presentation="fixed" flush>
        {/* The header floats in glass and the clip's properties scroll and fade under it. */}
        <ShellPaneHeader float>
          <Toolbar size="3" backdrop>
            <ToolbarTitle>Cathedral</ToolbarTitle>
            <Flex align="center" gap="2">
              <ToolbarButton emphasis="loud">Add effect</ToolbarButton>
              <ToolbarButton iconOnly aria-label="More">
                <Icons.More />
              </ToolbarButton>
            </Flex>
          </Toolbar>
        </ShellPaneHeader>
        <ShellScroll fade>
          <Stack gap="5" className="kd-edit-under-header">
            <SegmentedControl defaultValue="video" aria-label="Inspect" className="kd-edit-wide">
              <SegmentedItem value="video">Video</SegmentedItem>
              <SegmentedItem value="audio">Audio</SegmentedItem>
              <SegmentedItem value="info">Info</SegmentedItem>
            </SegmentedControl>
            <Group title="Transform">
              <Prop label="Position">
                <NumberFieldGroup label="Position">
                  <NumberField scrub="X" aria-label="X" defaultValue={0} />
                  <NumberField scrub="Y" aria-label="Y" defaultValue={-24} />
                </NumberFieldGroup>
              </Prop>
              <Prop label="Scale">
                <NumberField defaultValue={112} aria-label="Scale" format={{ style: "unit", unit: "percent" }} />
              </Prop>
              <Prop label="Rotation">
                <NumberField defaultValue={0} aria-label="Rotation" format={{ style: "unit", unit: "degree" }} />
              </Prop>
            </Group>
            <Separator />
            <Group title="Compositing">
              <Prop label="Blend">
                <Select defaultValue="normal" items={{ normal: "Normal", screen: "Screen", multiply: "Multiply" }}>
                  <SelectTrigger aria-label="Blend mode" />
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="screen">Screen</SelectItem>
                    <SelectItem value="multiply">Multiply</SelectItem>
                  </SelectContent>
                </Select>
              </Prop>
              <Prop label="Opacity">
                <Slider defaultValue={100} aria-label="Opacity" />
              </Prop>
            </Group>
            <Separator />
            <Group title="Timing">
              <Prop label="Speed" keyframe={false}>
                <SegmentedControl defaultValue="1" aria-label="Speed" className="kd-edit-wide">
                  <SegmentedItem value="0.5">0.5×</SegmentedItem>
                  <SegmentedItem value="1">1×</SegmentedItem>
                  <SegmentedItem value="2">2×</SegmentedItem>
                </SegmentedControl>
              </Prop>
              <Prop label="Reverse" keyframe={false}>
                <Switch aria-label="Reverse" />
              </Prop>
            </Group>
          </Stack>
        </ShellScroll>
      </ShellInspector>
      <ShellBottom aria-label="Timeline" defaultOpen>
        {/* The timeline's tools are its header band. It floats in glass, because the tracks
            scroll under it: a real edit has more layers than the pane shows. */}
        <ShellPaneHeader float>
          <Toolbar size="3" backdrop aria-label="Timeline tools">
            <Flex align="center" gap="3">
              <SegmentedControl defaultValue="select" aria-label="Tool">
                <SegmentedItem value="select" aria-label="Select">
                  <Icons.Select />
                </SegmentedItem>
                <SegmentedItem value="trim" aria-label="Trim">
                  <Icons.Trim />
                </SegmentedItem>
                <SegmentedItem value="blade" aria-label="Blade">
                  <Icons.Blade />
                </SegmentedItem>
                <SegmentedItem value="hand" aria-label="Hand">
                  <Icons.Hand />
                </SegmentedItem>
              </SegmentedControl>
              <ToolbarButton iconOnly emphasis="medium" aria-label="Snapping">
                <Icons.Magnet />
              </ToolbarButton>
              <ToolbarButton iconOnly aria-label="Add marker">
                <Icons.Marker />
              </ToolbarButton>
            </Flex>
            {/* Zoom is a control, not a caption: out, the slider, in. The selection is not
                repeated here; the inspector already names it. */}
            <Flex align="center" gap="2" className="kd-edit-zoom">
              <ToolbarButton iconOnly aria-label="Zoom out">
                <Icons.ZoomOut />
              </ToolbarButton>
              <Slider defaultValue={40} aria-label="Zoom" />
              <ToolbarButton iconOnly aria-label="Zoom in">
                <Icons.ZoomIn />
              </ToolbarButton>
            </Flex>
          </Toolbar>
        </ShellPaneHeader>
        <ShellScroll fade>
          <div className="kd-edit-timeline kd-edit-under-header">
            {timelineEnd ? <ScrolledToEnd /> : null}
            <div className="kd-edit-tracks">
              <div className="kd-edit-track">
                <span />
                <div className="kd-edit-lane kd-edit-ruler" aria-hidden>
                  {Array.from({ length: 9 }, (_, i) => i * 10).map((s) => (
                    <Text key={s} size="2" emphasis="quiet" style={{ left: `${(s / SPAN) * 100}%` }} className="kd-edit-tick">
                      {`${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`}
                    </Text>
                  ))}
                  {MARKERS.map((s) => (
                    <span key={s} className="kd-edit-marker" style={{ left: `${(s / SPAN) * 100}%` }} />
                  ))}
                </div>
              </div>
              {TRACKS.map((track) => (
                <div key={track.name} className="kd-edit-track" data-muted={track.muted || undefined}>
                  <div className="kd-edit-head">
                    <Text size="2" className="kd-edit-grow kd-edit-clip-name">
                      {track.name}
                    </Text>
                    {track.kind === "audio" ? (
                      <Button iconOnly emphasis="quiet" aria-label={track.muted ? `Unmute ${track.name}` : `Mute ${track.name}`}>
                        {track.muted ? <Icons.Muted /> : <Icons.Speaker />}
                      </Button>
                    ) : (
                      <Button iconOnly emphasis="quiet" aria-label={`Hide ${track.name}`}>
                        <Icons.Visible />
                      </Button>
                    )}
                    <Button iconOnly emphasis="quiet" aria-label={track.locked ? `Unlock ${track.name}` : `Lock ${track.name}`}>
                      {track.locked ? <Icons.Lock /> : <Icons.Unlock />}
                    </Button>
                  </div>
                  <div className="kd-edit-lane">
                    {track.clips.map((clip) => (
                      <div
                        key={clip.at}
                        className="kd-edit-clip"
                        data-kind={track.kind}
                        data-selected={clip.selected || undefined}
                        style={{ left: `${(clip.at / SPAN) * 100}%`, width: `${(clip.len / SPAN) * 100}%` }}
                      >
                        <Text size="2" className="kd-edit-clip-label">
                          {clip.name}
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div
                className="kd-edit-playhead"
                style={{ left: `calc(var(--kd-edit-head-w) + (100% - var(--kd-edit-head-w)) * ${PLAYHEAD / SPAN})` }}
              />
            </div>
            {/* Level meters, left and right, labelled so they never read as a scroll bar. */}
            <div className="kd-edit-meters" aria-label="Levels">
              <div className="kd-edit-meter-bars">
                <span style={{ blockSize: "68%" }} />
                <span style={{ blockSize: "61%" }} />
              </div>
              <Text size="2" emphasis="quiet">
                L R
              </Text>
            </div>
          </div>
        </ShellScroll>
      </ShellBottom>
    </Shell>
  );
}
