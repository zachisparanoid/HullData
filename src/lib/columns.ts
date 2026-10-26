// Single source of truth for table columns — shared by BoatTable (definitions),
// ColumnVisibilityMenu (toggles), and the store (default visibility map). Keeping
// the ids in one place guarantees the visibility keys always line up.

export interface ColumnMeta {
  id: string;
  /** Header label (empty for the thumbnail column). */
  label: string;
  /** Short label for the column-visibility menu. */
  menuLabel: string;
  defaultVisible: boolean;
  /** Name + thumbnail are pinned and cannot be hidden. */
  alwaysVisible?: boolean;
  /** Right-aligned monospaced numeric column. */
  numeric?: boolean;
}

export const COLUMN_META: ColumnMeta[] = [
  { id: "name", label: "Boat", menuLabel: "Boat name", defaultVisible: true, alwaysVisible: true },
  { id: "thumbnail", label: "", menuLabel: "Thumbnail", defaultVisible: true, alwaysVisible: true },
  { id: "years", label: "Years", menuLabel: "Years", defaultVisible: true },
  { id: "loa", label: "LOA", menuLabel: "Length (LOA)", defaultVisible: true, numeric: true },
  { id: "beam", label: "Beam", menuLabel: "Beam", defaultVisible: true, numeric: true },
  { id: "draft", label: "Draft", menuLabel: "Draft", defaultVisible: true, numeric: true },
  { id: "engines", label: "Engines", menuLabel: "Engines", defaultVisible: true },
  { id: "totalHp", label: "Total HP", menuLabel: "Total horsepower", defaultVisible: true, numeric: true },
  { id: "speed", label: "Cruise / Top", menuLabel: "Cruise / top speed", defaultVisible: true, numeric: true },
  { id: "range", label: "Range", menuLabel: "Range", defaultVisible: true, numeric: true },
  { id: "fuel", label: "Fuel", menuLabel: "Fuel capacity", defaultVisible: true, numeric: true },
  { id: "displacement", label: "Displ.", menuLabel: "Displacement", defaultVisible: false, numeric: true },
  { id: "hull", label: "Hull", menuLabel: "Hull material / type", defaultVisible: true },
  { id: "berths", label: "Cabins / Heads", menuLabel: "Staterooms / heads", defaultVisible: true, numeric: true },
];

export const TOGGLEABLE_COLUMNS = COLUMN_META.filter((c) => !c.alwaysVisible);

export const DEFAULT_COLUMN_VISIBILITY: Record<string, boolean> =
  Object.fromEntries(COLUMN_META.map((c) => [c.id, c.defaultVisible]));
