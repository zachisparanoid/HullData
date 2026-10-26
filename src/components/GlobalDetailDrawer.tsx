"use client";

import { useMemo } from "react";
import { useGlobalStore } from "@/store/useGlobalStore";
import { useExplorerStore } from "@/store/useExplorerStore";
import BoatDetailView from "@/components/BoatDetailView";

/** Cross-builder detail drawer — bound to the global store; links back to the
 *  builder's full catalog so a discovery can flow into a focused browse. */
export default function GlobalDetailDrawer() {
  const selectedBoatId = useGlobalStore((s) => s.selectedBoatId);
  const boats = useGlobalStore((s) => s.boats);
  const openBoat = useGlobalStore((s) => s.openBoat);
  const unit = useExplorerStore((s) => s.unit);
  const speedMph = useExplorerStore((s) => s.speedMph);

  const boat = useMemo(
    () => boats.find((b) => b.id === selectedBoatId) ?? null,
    [boats, selectedBoatId],
  );

  return (
    <BoatDetailView
      model={boat}
      manufacturerName={boat?.manufacturerName}
      website={boat?.manufacturerWebsite}
      manufacturerHref={
        boat ? `/?m=${encodeURIComponent(boat.manufacturerSlug)}` : undefined
      }
      unit={unit}
      speedMph={speedMph}
      onClose={() => openBoat(null)}
    />
  );
}
