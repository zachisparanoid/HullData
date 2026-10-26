"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

// MotionConfig reducedMotion="user" makes every Framer Motion animation in the
// tree automatically honor the OS "reduce motion" setting.
export default function Providers({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
