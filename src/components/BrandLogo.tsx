import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  logoUrl?: string | null;
  className?: string;
  textClassName?: string;
};

/** Brand logo with graceful text-wordmark fallback when the image is missing or fails to load. */
export function BrandLogo({ name, logoUrl, className, textClassName }: Props) {
  const [failed, setFailed] = useState(false);
  const showImage = !!logoUrl && !failed;

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center bg-background",
        className,
      )}
    >
      {showImage ? (
        <img
          src={logoUrl!}
          alt={`${name} logo`}
          loading="lazy"
          onError={() => setFailed(true)}
          className="max-h-full max-w-full object-contain"
        />

      ) : (
        <span
          className={cn(
            "font-extrabold tracking-tight uppercase text-foreground/85 leading-none text-center px-1",
            textClassName,
          )}
          style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", letterSpacing: "-0.02em" }}
        >
          {name}
        </span>
      )}
    </div>
  );
}
