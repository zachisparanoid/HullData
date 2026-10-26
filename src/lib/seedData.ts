import type { SeedManufacturer } from "./seedTypes";
import { groupA } from "./seed/groupA";
import { groupB } from "./seed/groupB";
import { groupC } from "./seed/groupC";
import { groupD } from "./seed/groupD";
import { groupE } from "./seed/groupE";
import { groupF } from "./seed/groupF";
import { groupG } from "./seed/groupG";
import { groupH } from "./seed/groupH";
import { groupI } from "./seed/groupI";
import { groupJ } from "./seed/groupJ";
import { groupK } from "./seed/groupK";
import { groupL } from "./seed/groupL";
import { groupM } from "./seed/groupM";
import { groupN } from "./seed/groupN";
import { groupO } from "./seed/groupO";
import { groupP } from "./seed/groupP";

/**
 * The complete curated HullData catalog, assembled from the group modules.
 * Every vessel here is POWERED — there are no sailboats, by construction
 * (the category/propulsion unions have no sail value).
 *
 * Groups A-E: the original 14 builders.
 * Groups F-M: trawlers, sportfish, center consoles, classic American, Euro/Aussie.
 * Groups N-P: classic affordable / vintage trawler makes (Marine Trader, CHB,
 *   Island Gypsy, Albin, Monk, Willard, Cheoy Lee, Krogen Express, Californian).
 */
export const seedManufacturers: SeedManufacturer[] = [
  ...groupA,
  ...groupB,
  ...groupC,
  ...groupD,
  ...groupE,
  ...groupF,
  ...groupG,
  ...groupH,
  ...groupI,
  ...groupJ,
  ...groupK,
  ...groupL,
  ...groupM,
  ...groupN,
  ...groupO,
  ...groupP,
];
