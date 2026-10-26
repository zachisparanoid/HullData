import type { Metadata } from "next";
import GlobalExplorer from "@/components/GlobalExplorer";

export const metadata: Metadata = {
  title: "Explore all builders — HullData",
  description:
    "Search and compare production powerboats across every builder at once. Filter the whole catalog by length, power, year, hull, and builder, then compare up to four boats side by side.",
};

export default function ExplorePage() {
  return <GlobalExplorer />;
}
