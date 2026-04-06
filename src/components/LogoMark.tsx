import Image from "next/image";
import { siCisco, siDell, siLenovo, siVmware } from "simple-icons";

import type { VendorLogoKey } from "@/data/site";

const logoMap = {
  microsoft: {
    kind: "image",
    src: "/partners/microsoft.svg",
    width: 28,
    height: 28,
    className: "partner-strip__mark--microsoft",
  },
  acronis: {
    kind: "image",
    src: "/partners/acronis.svg",
    width: 108,
    height: 28,
    className: "partner-strip__mark--wide",
  },
  dell: {
    kind: "icon",
    path: siDell.path,
    hex: siDell.hex,
  },
  lenovo: {
    kind: "icon",
    path: siLenovo.path,
    hex: siLenovo.hex,
  },
  vmware: {
    kind: "icon",
    path: siVmware.path,
    hex: siVmware.hex,
  },
  cisco: {
    kind: "icon",
    path: siCisco.path,
    hex: siCisco.hex,
  },
  sophos: {
    kind: "image",
    src: "/partners/sophos.svg",
    width: 112,
    height: 28,
    className: "partner-strip__mark--wide",
  },
} as const;

type LogoMarkProps = {
  logo: VendorLogoKey;
  alt: string;
  className?: string;
};

export function LogoMark({ logo, alt, className }: LogoMarkProps) {
  const item = logoMap[logo];

  if (item.kind === "image") {
    return (
      <Image
        alt={alt}
        className={`partner-strip__mark ${item.className} ${className ?? ""}`.trim()}
        height={item.height}
        src={item.src}
        width={item.width}
      />
    );
  }

  return (
    <svg
      aria-label={alt}
      className={`partner-strip__icon ${className ?? ""}`.trim()}
      role="img"
      viewBox="0 0 24 24"
    >
      <path d={item.path} fill={`#${item.hex}`} />
    </svg>
  );
}
