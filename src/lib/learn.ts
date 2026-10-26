// Editorial content for the /learn page: a newcomer glossary, a "how to read
// the spec sheet" key, and a "what to look for" buyer's guide per category.
// Plain language, written for someone shopping their first powerboat.

import type { BoatCategory } from "./types";

export interface GlossaryTerm {
  term: string;
  def: string;
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    term: "LOA (length overall)",
    def: "The boat's total length end to end, including pulpits and swim platforms. It's what marinas measure for slip fees, so it matters more than the model's name number.",
  },
  {
    term: "Beam",
    def: "The width at the widest point. More beam means more interior volume and stability — but anything over 8'6\" can't be trailered on the road without a wide-load permit.",
  },
  {
    term: "Draft",
    def: "How deep the boat sits below the waterline. Shallow draft (under ~3 ft) opens up thin water and skinny anchorages; deep draft limits where you can go but often rides better offshore.",
  },
  {
    term: "Displacement",
    def: "How much the boat weighs (it 'displaces' that weight in water). Heavier boats generally ride more comfortably in a chop but need more power and fuel to move.",
  },
  {
    term: "Freeboard",
    def: "The height of the hull from the waterline to the deck. More freeboard keeps you drier and feels safer offshore; less makes boarding and fishing easier.",
  },
  {
    term: "Knot",
    def: "One nautical mile per hour, the standard unit of boat speed. A knot is about 1.15 mph. HullData shows knots by default — flip the units menu for mph.",
  },
  {
    term: "Nautical mile (nm)",
    def: "About 1.15 statute miles. Range and distances on the water are measured in nautical miles.",
  },
  {
    term: "Range",
    def: "How far the boat can travel on one tank at cruise speed, usually with a fuel reserve held back. The single most important number for long-distance cruising.",
  },
  {
    term: "Stateroom",
    def: "A private sleeping cabin. Two or more staterooms is the usual threshold for comfortably living aboard or cruising with guests.",
  },
  {
    term: "Head",
    def: "A marine bathroom. Boats are listed by the number of heads; a separate stall shower is a step up in comfort.",
  },
  {
    term: "Galley",
    def: "The boat's kitchen. 'Galley up' means it's on the main deck with the views; 'galley down' tucks it below for more saloon seating.",
  },
  {
    term: "Saloon (salon)",
    def: "The main living/lounge cabin. Spelled 'saloon' in boating tradition, pronounced 'salon'.",
  },
  {
    term: "Helm",
    def: "The steering station — wheel, throttles, and electronics. A boat may have a lower (inside) helm and an upper helm on the flybridge.",
  },
  {
    term: "Flybridge",
    def: "An upper steering station and seating area on top of the cabin. Great visibility and breeze; adds height, weight, and windage.",
  },
  {
    term: "Bow / Stern",
    def: "The front (bow) and back (stern) of the boat.",
  },
  {
    term: "Port / Starboard",
    def: "Left (port) and right (starboard) when facing forward. Port and 'left' both have four letters — an easy way to remember.",
  },
  {
    term: "Keel",
    def: "The backbone along the bottom of the hull. A deep keel tracks straighter and protects running gear when grounding; a shallow keel reduces draft.",
  },
  {
    term: "Deadrise",
    def: "The V-angle of the hull bottom at the transom. High deadrise (a deep-V) slices chop smoothly but rolls more at rest; low deadrise rides flatter and more stable but pounds in waves.",
  },
  {
    term: "Chine",
    def: "The edge where the bottom of the hull meets the sides. Hard chines add stability and lift; soft (rounded) chines ride more gently.",
  },
  {
    term: "Gunwale (gunnel)",
    def: "The top edge of the boat's side. What you lean against and mount rod holders to.",
  },
  {
    term: "Bridge clearance",
    def: "The height from the waterline to the highest fixed point. It decides which fixed bridges you can pass under — critical on routes like the Intracoastal Waterway.",
  },
  {
    term: "GRP / fiberglass",
    def: "Glass-reinforced plastic — the fiberglass most production boats are built from. Strong, low-maintenance, and repairable.",
  },
];

export interface SpecKeyEntry {
  label: string;
  def: string;
}

export const SPEC_KEY: SpecKeyEntry[] = [
  {
    label: "Years",
    def: "The production run. A long run usually means a proven, well-supported design with parts and surveyors who know it.",
  },
  {
    label: "LOA / Beam / Draft",
    def: "Length, width, and depth below the waterline — the three numbers that decide where the boat fits and where it can go.",
  },
  {
    label: "Engines / Total HP",
    def: "The powerplant and combined horsepower. Trawlers run modest power for economy; sportfish and express boats carry big horsepower for speed.",
  },
  {
    label: "Cruise / Top speed",
    def: "Cruise is the comfortable all-day pace you'll actually run; top is the maximum. Range and fuel burn are quoted at cruise.",
  },
  {
    label: "Range",
    def: "Distance on one tank at cruise. Pair it with cruise speed to estimate a day's run.",
  },
  {
    label: "Fuel / Displacement",
    def: "Tank size and how much the boat weighs. Together they drive how far and how comfortably it travels.",
  },
  {
    label: "Cabins / Heads",
    def: "Staterooms and bathrooms — the quick read on whether a boat suits day trips, weekends, or living aboard.",
  },
];

export interface CategoryGuide {
  category: BoatCategory;
  tagline: string;
  whatItIs: string;
  bestFor: string[];
  watchFor: string[];
}

// Ordered to lead with the user's trawler interest.
export const CATEGORY_GUIDES: CategoryGuide[] = [
  {
    category: "TRAWLER",
    tagline: "Go-anywhere economy and comfort at displacement speed",
    whatItIs:
      "A seaworthy, fuel-sipping cruiser built around a displacement or semi-displacement hull. Trawlers trade speed for range, comfort, and the ability to cross open water and live aboard. They're the classic choice for the Great Loop, the Inside Passage, and long-term cruising.",
    bestFor: [
      "Long-distance and live-aboard cruising",
      "Fuel economy — often 1.5–3+ nautical miles per gallon",
      "Comfortable motion and big interior volume for the length",
      "Shoal-draft 'sedan' models that reach skinny water",
    ],
    watchFor: [
      "Cruise speed of 7–10 knots — patience required",
      "Single-engine models are economical but dock and maneuver differently",
      "Tankage and range vary widely; confirm real-world numbers, not brochure figures",
      "Older wood or steel hulls need a knowledgeable surveyor",
    ],
  },
  {
    category: "MOTOR_YACHT",
    tagline: "Maximum accommodation and amenities for the length",
    whatItIs:
      "A larger cruiser focused on living space — multiple staterooms, a full galley, and often two helms. Motor yachts span economical semi-displacement passagemakers to fast planing models; the common thread is comfort and volume.",
    bestFor: [
      "Extended cruising with family or guests",
      "Entertaining and living aboard in marina comfort",
      "Two or more staterooms and full standing headroom",
    ],
    watchFor: [
      "Higher running and dockage costs that scale with size",
      "Big windage makes docking in wind a learned skill",
      "Systems complexity (generators, AC, watermakers) means more to maintain",
    ],
  },
  {
    category: "SPORTFISH",
    tagline: "Offshore fishing machines with serious range and speed",
    whatItIs:
      "Purpose-built to chase pelagic fish far offshore. A deep-V hull, big fuel, a cockpit set up for fighting fish, and a tuna tower for spotting. Convertibles add a full cabin so you can run overnight to the canyons.",
    bestFor: [
      "Serious offshore fishing and tournament work",
      "Fast passages to distant grounds in a head sea",
      "Big fuel capacity for long runs",
    ],
    watchFor: [
      "Thirsty — high horsepower means high fuel burn",
      "Premium price for fishing-specific gear you'll pay to maintain",
      "Deep-V rolls at rest; many add stabilizers",
    ],
  },
  {
    category: "EXPRESS_CRUISER",
    tagline: "Sleek weekenders with a single-level, open layout",
    whatItIs:
      "A sporty cruiser with a low profile and a single-level cockpit-to-cabin flow, sleeping accommodations below. Express boats prize style, speed, and easy handling for weekends and day trips.",
    bestFor: [
      "Day trips and weekend getaways for a couple or small family",
      "Lively performance and easy single-level access",
      "Lower bridge clearance for getting under fixed bridges",
    ],
    watchFor: [
      "Less interior headroom and volume than a flybridge boat the same length",
      "Open helm is exposed to weather without a hardtop",
      "Cabin light and air depend on hatches and ports — check ventilation",
    ],
  },
  {
    category: "FLYBRIDGE",
    tagline: "An upper helm and lounge for visibility and breeze",
    whatItIs:
      "A cruiser with a second steering station and seating up top. The flybridge adds commanding visibility for docking and navigating, plus a social space — at the cost of height and weight up high.",
    bestFor: [
      "Visibility for docking, cruising, and watching the water",
      "Extra outdoor seating and a social hub underway",
      "Families wanting both an inside and outside helm",
    ],
    watchFor: [
      "Added height means more bridge-clearance and windage to manage",
      "Weight up high can increase roll; many carry stabilizers",
      "Canvas or a hardtop is a must for sun and weather up top",
    ],
  },
  {
    category: "CENTER_CONSOLE",
    tagline: "Open, unsinkable-feeling fishing and family day boats",
    whatItIs:
      "An open boat with the helm on a console in the middle, giving 360° walk-around access to fish or move about. Modern center consoles run multiple outboards and have grown into capable, fast offshore day boats.",
    bestFor: [
      "Inshore and offshore fishing with full walk-around access",
      "Fast, simple, low-maintenance outboard power",
      "Family day trips, sandbars, and watersports",
    ],
    watchFor: [
      "Little or no enclosed cabin — limited weather protection",
      "Day-boat focus; overnight comfort is minimal",
      "Multiple big outboards add up in purchase and fuel",
    ],
  },
];
