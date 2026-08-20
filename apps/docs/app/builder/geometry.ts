/**
 * The drop scan's arithmetic, as pure functions over rectangles (2026-08-20).
 *
 * `placement.ts` answers in TREE coordinates and states that nothing in it measures a pixel.
 * This is the other half: given boxes and a pointer, which index does a drop land at and
 * where does the line draw. It lives here rather than inside the app so it can be held to a
 * law — the version it replaces could only be checked by dragging, and it was wrong for two
 * of the four layouts the builder ships.
 *
 * ONE measurement serves all four. The children are grouped into visual ROWS by vertical
 * overlap: a Stack is N rows of one, a Flex row is one row of N, and a wrapped Flex or a
 * Grid is the general case. Nothing here asks the document which layout it is; the boxes say
 * it. That grouping already existed for the gap bands and was never promoted — the scan
 * asked the container's `display` instead and got two answers, "flex row" and "everything
 * else, measured on Y". So the two cells of a grid row shared a vertical midpoint, the scan
 * stepped over both at once and position 1 was unreachable, while the line drew a full-width
 * bar across the grid claiming to be between two rows the pointer was not between.
 */

/** The narrowest room the canvas will state. Below this a document has nothing to compose in. */
export const CANVAS_MIN_W = 280;

/**
 * The canvas's width in CSS pixels — the ROOM, which is what both width gestures write.
 *
 * `stated` is the truth whenever there is one, and the two spellings this replaces got that
 * wrong in opposite directions. Dividing only the pointer's DELTA left the base in painted
 * pixels, so a grab at 50% jumped the canvas 880 → 442. Dividing the MEASURED box by the zoom
 * fixed that below 1 and broke it above, because the painted box also carries `maxWidth: 100%`
 * inside an 880px parent and is therefore clamped past zoom 1 — measured at 150%: styled
 * 1320px, `offsetWidth` 880 — so a grab that moved ZERO pixels collapsed the canvas 880 → 587
 * and flipped every container tier inside it.
 *
 * The measurement survives only as the opening value, and only at zoom 1: zooming pins the
 * width before it changes the zoom, so a null width and a zoom other than 1 cannot coexist.
 */
export const canvasRoom = (stated: number | null, measured: number, zoom: number): number =>
  stated ?? measured / zoom;

/** The width a width-drag writes. The pointer travels in SCREEN pixels; the room is CSS ones. */
export const widthAfterDrag = (startRoom: number, dxScreen: number, zoom: number): number =>
  Math.max(CANVAS_MIN_W, Math.round(startRoom + dxScreen / zoom));

/** Just enough of a DOMRect to do the arithmetic, so a law can build one by hand. */
export type Box = { top: number; left: number; right: number; bottom: number; width: number; height: number };

export const box = (left: number, top: number, width: number, height: number): Box => ({
  left,
  top,
  width,
  height,
  right: left + width,
  bottom: top + height,
});

export type Spot = {
  /** Where the node lands among its siblings, in DOCUMENT order. */
  index: number;
  /** The row the pointer is in, or a half-step when it is in the gutter between two. */
  pointerRow: number;
  /** Vertical means "between two cells of one row"; horizontal means "between rows". */
  orientation: "vertical" | "horizontal";
  /** The line, in the same space the boxes were given in. */
  line: { x: number; y: number; w: number; h: number };
};

/** The children grouped into visual rows, each row holding the DOCUMENT indices in it. */
export const rowsOf = (boxes: readonly Box[]): number[][] => {
  const rows: number[][] = [];
  const order = boxes.map((b, i) => ({ b, i })).sort((p, q) => p.b.top - q.b.top || p.b.left - q.b.left);
  for (const { b, i } of order) {
    const row = rows[rows.length - 1];
    // Same visual row when the boxes overlap vertically at all — robust against items of
    // different heights sitting on one line, which a top-coordinate match is not.
    if (row && b.top < Math.max(...row.map((k) => boxes[k]!.bottom))) row.push(i);
    else rows.push([i]);
  }
  return rows;
};

/**
 * The scan's answer translated back into the CHILD LIST's own indices.
 *
 * `dropSpot` answers a position among the boxes it was handed, and the app hands it only the
 * children it could measure. Where those two lists differ — a child the renderer put no
 * element on — the scan's index counts from the wrong list, and "before the third box I can
 * see" silently becomes "before the third child", which is a different place.
 *
 * `positions` is each measured box's index in the full list, in the same order. One past the
 * end means "after everything", which is the full list's length, not the measured one's.
 */
export const documentIndex = (positions: readonly number[], scanIndex: number, total: number): number =>
  scanIndex < positions.length ? positions[scanIndex]! : total;

export const dropSpot = (boxes: readonly Box[], container: Box, x: number, y: number): Spot | null => {
  if (boxes.length === 0) return null;
  const rows = rowsOf(boxes);
  const rowOf = new Map(rows.flatMap((row, k) => row.map((i) => [i, k] as const)));
  const top = (k: number) => Math.min(...rows[k]!.map((i) => boxes[i]!.top));
  const bottom = (k: number) => Math.max(...rows[k]!.map((i) => boxes[i]!.bottom));

  // Where the pointer sits in that stack of rows. A half-step means it is in the gutter
  // BETWEEN two rows, which is a different drop — and a different line — from being in one.
  let pointerRow = rows.length - 0.5;
  for (let k = 0; k < rows.length; k++) {
    if (y < top(k)) {
      pointerRow = k - 0.5;
      break;
    }
    if (y <= bottom(k)) {
      pointerRow = k;
      break;
    }
  }

  /* Which axis decides the pointer's half of the item it is OVER. A container whose every
     row holds one item is a column — the items stack, so the half is vertical, and that is
     what makes a Stack read correctly without anyone naming it one. Anything else flows
     horizontally within its rows.

     Asking it per ROW instead was wrong on the case that has both: a wrapped Flex whose last
     line holds one item. Measured — six cards wrapping to two lines, hovering the LEFT half
     of the only item on line two — the per-row reading called that line a column, decided on
     Y and inserted AFTER the item the pointer was pointing at the front of. The container is
     what flows, not the row. */
  const columnar = rows.every((r) => r.length === 1);
  const isAfter = (i: number): boolean => {
    const k = rowOf.get(i)!;
    if (pointerRow !== k) return pointerRow > k;
    const b = boxes[i]!;
    return columnar ? y > b.top + b.height / 2 : x > b.left + b.width / 2;
  };
  const index = boxes.map((_, i) => i).filter(isAfter).length;

  // …and the line follows the same axis, so a single item on a wrapped line gets a vertical
  // line beside it rather than a full-width bar through the gutter it is not in.
  const inRow = Number.isInteger(pointerRow) && !columnar;
  if (inRow) {
    const row = [...rows[pointerRow]!].sort((p, q) => boxes[p]!.left - boxes[q]!.left);
    const beforeB = [...row].reverse().find((i) => x > boxes[i]!.left + boxes[i]!.width / 2);
    const afterB = row.find((i) => x <= boxes[i]!.left + boxes[i]!.width / 2);
    const at =
      beforeB !== undefined && afterB !== undefined
        ? (boxes[beforeB]!.right + boxes[afterB]!.left) / 2
        : beforeB !== undefined
          ? boxes[beforeB]!.right + 3
          : boxes[afterB!]!.left - 3;
    return {
      index,
      pointerRow,
      orientation: "vertical",
      line: { x: at - 1, y: top(pointerRow), w: 2, h: bottom(pointerRow) - top(pointerRow) },
    };
  }

  /* The line goes in the gutter the INDEX names, read off the two items that straddle it in
     document order. Deriving it from the pointer's row instead looks equivalent and is not:
     inside a row holding ONE item — every row of a Stack — `above` and `below` are the same
     row, and the midpoint of a row is the middle of the item the pointer is over, not the
     gutter the drop lands in. Measured, before this: hovering the lower half of the first of
     three stacked items gave index 1 and drew the line at y=19, through the middle of item
     zero and ABOVE the pointer, while the drop landed at y≈45. Two different drops drew the
     same line.

     In this branch the two neighbours always straddle a row boundary — a pointer in a gutter
     puts every item above it before and every item below it after, and a pointer inside a
     single-item row has that item on one side and another row's on the other.

     Their own edges are NOT the gutter, though, and the first spelling of this said they were.
     A row's extent is the union of its children, so in a row of unequal heights the last item
     in document order need not be the lowest: a tall card beside a short centred button ended
     at 204 while the button ended at 171, and dropping below the row drew the line at 173,
     through the middle of the card it had just landed after. Read the gutter off the ROWS the
     index falls between and the arithmetic is the same shape with the right numbers in it. */
  const rowBefore = index > 0 ? rowOf.get(index - 1)! : undefined;
  const rowAfter = index < boxes.length ? rowOf.get(index)! : undefined;
  const at =
    rowBefore !== undefined && rowAfter !== undefined
      ? (bottom(rowBefore) + top(rowAfter)) / 2
      : rowBefore !== undefined
        ? bottom(rowBefore) + 3
        : top(rowAfter!) - 3;
  return {
    index,
    pointerRow,
    orientation: "horizontal",
    line: { x: container.left, y: at - 1, w: container.width, h: 2 },
  };
};
