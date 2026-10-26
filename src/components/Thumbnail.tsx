"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { categoryPlaceholder } from "@/lib/placeholders";
import type { BoatCategory } from "@/lib/types";

// Dark blurred stand-in shown while the image loads.
const BLUR =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Crect width='8' height='5' fill='%23172230'/%3E%3C/svg%3E";

interface ThumbnailProps {
  src: string | null;
  alt: string;
  category: BoatCategory;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  /** Fill the (relatively-positioned) parent instead of using width/height. */
  fill?: boolean;
  priority?: boolean;
}

export default function Thumbnail({
  src,
  alt,
  category,
  width = 96,
  height = 64,
  className = "",
  sizes,
  fill = false,
  priority = false,
}: ThumbnailProps) {
  const fallback = categoryPlaceholder(category);
  const [current, setCurrent] = useState(src || fallback);

  // If the model's image prop changes (e.g. switching boats), reset.
  useEffect(() => {
    setCurrent(src || fallback);
  }, [src, fallback]);

  const handleError = () => {
    if (current !== fallback) setCurrent(fallback);
  };

  const common = {
    src: current || fallback,
    onError: handleError,
    placeholder: "blur" as const,
    blurDataURL: BLUR,
    draggable: false,
    priority,
    className,
  };

  if (fill) {
    return <Image {...common} alt={alt} fill sizes={sizes ?? "100vw"} />;
  }
  return (
    <Image
      {...common}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes ?? `${width}px`}
    />
  );
}
