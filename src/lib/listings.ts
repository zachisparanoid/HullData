// Outbound "find one for sale" search links. HullData is a reference library,
// not a marketplace — these just hand the make + model off to the big brokerage
// sites and a general web search. Each opens the site's keyword search; if a
// param is ignored the user still lands on a relevant search page.

import { fullModelName } from "./format";

export interface ListingLink {
  label: string;
  href: string;
}

export function listingLinks(make: string, model: string): ListingLink[] {
  const query = fullModelName(make, model).replace(/\s+/g, " ").trim();
  const kw = encodeURIComponent(query);
  return [
    {
      label: "YachtWorld",
      href: `https://www.yachtworld.com/boats-for-sale/?keyword=${kw}`,
    },
    {
      label: "Boat Trader",
      href: `https://www.boattrader.com/boats/keyword-${kw}/`,
    },
    {
      label: "boats.com",
      href: `https://www.boats.com/boats-for-sale/?query=${kw}`,
    },
    {
      label: "Web search",
      href: `https://www.google.com/search?q=${encodeURIComponent(
        `${query} for sale`,
      )}`,
    },
  ];
}
