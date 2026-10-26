import { Suspense } from "react";
import Explorer from "@/components/Explorer";

// The Explorer reads useSearchParams, so it lives behind a Suspense boundary.
export default function Page() {
  return (
    <Suspense fallback={null}>
      <Explorer />
    </Suspense>
  );
}
