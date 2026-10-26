"use client";

import { useMemo } from "react";
import { useExplorerStore } from "@/store/useExplorerStore";
import BoatDetailView from "@/components/BoatDetailView";

/** Per-builder detail drawer — bound to the manufacturer-scoped explorer store. */
export default function BoatDetailDrawer() {
  const selectedBoatId = useExplorerStore((s) => s.selectedBoatId);
  const catalog = useExplorerStore((s) => s.catalog);
  const unit = useExplorerStore((s) => s.unit);
  const speedMph = useExplorerStore((s) => s.speedMph);
  const openBoat = useExplorerStore((s) => s.openBoat);

  const model = useMemo(
    () => catalog?.models.find((m) => m.id === selectedBoatId) ?? null,
    [catalog, selectedBoatId],
  );

  return (
    <BoatDetailView
      model={model}
      manufacturerName={catalog?.name}
      website={catalog?.website}
      unit={unit}
      speedMph={speedMph}
      onClose={() => openBoat(null)}
    />
  );
}
