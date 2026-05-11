"use client";

import { useState } from "react";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookCoverProps {
  src: string | null | undefined;
  title: string;
  className?: string;
  priority?: boolean;
}

export function BookCover({ src, title, className, priority }: BookCoverProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (!src || error) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-gradient-to-br from-sienna/10 to-teal/10 rounded-lg",
        className
      )}>
        <div className="text-center p-4">
          <BookOpen className="h-8 w-8 text-sienna/40 mx-auto mb-1" />
          <p className="text-xs text-charcoal/40 dark:text-ivory/40 font-medium leading-tight line-clamp-3">
            {title}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      {loading && <div className="absolute inset-0 skeleton" />}
      <Image
        src={src}
        alt={title}
        fill
        className={cn("object-cover transition-opacity duration-300", loading ? "opacity-0" : "opacity-100")}
        onError={() => setError(true)}
        onLoad={() => setLoading(false)}
        priority={priority}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    </div>
  );
}
