"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends Omit<ImageProps, "onLoad"> {
  fallback?: string;
  wrapperClassName?: string;
}

// A tiny generic blurred gray placeholder
const defaultBlurDataURL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mN8/x8AAuMB8DtXNJsAAAAASUVORK5CYII=";

export function OptimizedImage({
  src,
  alt,
  className,
  wrapperClassName,
  fallback = "/placeholder.jpg",
  placeholder = "blur",
  blurDataURL = defaultBlurDataURL,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-slate-200 dark:bg-slate-800",
        wrapperClassName
      )}
    >
      <Image
        {...props}
        src={imgSrc}
        alt={alt}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        className={cn(
          "duration-700 ease-in-out",
          isLoading
            ? "scale-105 blur-md grayscale"
            : "scale-100 blur-0 grayscale-0",
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImgSrc(fallback);
          setIsLoading(false);
        }}
      />
    </div>
  );
}
