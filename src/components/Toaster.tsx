"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useToast } from "@/store/useToast";

export default function Toaster() {
  const message = useToast((s) => s.message);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex justify-center px-4">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            role="status"
            className="pointer-events-auto flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink shadow-2xl"
          >
            <Check className="h-4 w-4 text-accent" strokeWidth={2.5} />
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
