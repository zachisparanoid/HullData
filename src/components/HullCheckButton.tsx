"use client";

import { useState } from "react";
import { ClipboardCheck, Check } from "lucide-react";
import { buildSurveyBundle } from "@/lib/hullcheck";
import { fullModelName } from "@/lib/format";
import { modelKey } from "@/lib/imageKey";
import type { BoatModelData } from "@/lib/types";

/**
 * Downloads a HullCheck-importable project file for this boat, pre-filled with
 * its make/model/type/length/year, seed notes, and the standard survey
 * checklist. The user imports it in HullCheck → New Project → Import.
 */
export default function HullCheckButton({
  model,
  make,
}: {
  model: BoatModelData;
  make: string;
}) {
  const [done, setDone] = useState(false);

  const handleDownload = () => {
    const bundle = buildSurveyBundle(model, make, new Date());
    const blob = new Blob([JSON.stringify(bundle, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${modelKey(fullModelName(make, model.name))}.hullcheck.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDone(true);
    setTimeout(() => setDone(false), 2500);
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-accent/15"
    >
      {done ? (
        <>
          <Check className="h-4 w-4 text-accent" />
          Downloaded — import it in HullCheck
        </>
      ) : (
        <>
          <ClipboardCheck className="h-4 w-4 text-accent" />
          Start a survey in HullCheck
        </>
      )}
    </button>
  );
}
