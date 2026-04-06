"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { GlobeIcon } from "@/components/icons";
import type { Locale } from "@/data/site";

type LanguageSwitcherProps = {
  locale: Locale;
  label: string;
};

function toEnglishPath(pathname: string) {
  if (pathname === "/pt") {
    return "/";
  }

  if (pathname.startsWith("/pt/")) {
    return pathname.slice(3);
  }

  return pathname || "/";
}

function toPortuguesePath(pathname: string) {
  if (pathname === "/") {
    return "/pt";
  }

  if (pathname.startsWith("/pt")) {
    return pathname;
  }

  return `/pt${pathname}`;
}

export function LanguageSwitcher({
  locale,
  label,
}: LanguageSwitcherProps) {
  const pathname = usePathname() || "/";
  const targetPath =
    locale === "en" ? toPortuguesePath(pathname) : toEnglishPath(pathname);

  return (
    <Link className="language-switcher" href={targetPath}>
      <GlobeIcon className="language-switcher__icon" />
      <span>{label}</span>
    </Link>
  );
}
