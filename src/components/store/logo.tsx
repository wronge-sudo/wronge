import Image from "next/image";
import Link from "next/link";
import { ASSETS, ASSET_SIZES } from "@/config/assets";
import { cn } from "@/lib/format";

export function Logo({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <Link href="/" aria-label="Wronge — home" className={cn("inline-flex shrink-0 items-center", className)}>
      <Image
        src={light ? ASSETS.wordmarkWhite : ASSETS.wordmarkBlack}
        alt="WRONGE"
        width={ASSET_SIZES.wordmark.width}
        height={ASSET_SIZES.wordmark.height}
        loading="eager"
        className="h-6 w-auto sm:h-7"
      />
    </Link>
  );
}
