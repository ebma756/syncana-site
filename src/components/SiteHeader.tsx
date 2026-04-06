import Image from "next/image";
import Link from "next/link";

import { ArrowRightIcon } from "@/components/icons";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { navigation, siteCopy, withLocale, type Locale } from "@/data/site";

type SiteHeaderProps = {
  locale: Locale;
  pathname: string;
};

export function SiteHeader({ locale, pathname }: SiteHeaderProps) {
  const copy = siteCopy[locale];

  return (
    <>
      <a className="skip-link" href="#main-content">
        {copy.skipToContent}
      </a>
      <header className="site-header">
        <div className="container site-header__inner">
          <Link className="site-logo" href={withLocale(locale, "/")}>
            <Image
              alt="Syncana Technologies"
              height={52}
              priority
              src="/logos/syncana-logo.svg"
              width={178}
            />
          </Link>
          <div className="site-header__nav-wrap">
            <nav aria-label="Primary" className="site-nav">
              {navigation.map((item) => {
                const href = withLocale(locale, item.href);
                const isActive =
                  pathname === href ||
                  (href !== withLocale(locale, "/") && pathname.startsWith(`${href}/`));

                return (
                  <Link
                    key={item.key}
                    className={`site-nav__link ${isActive ? "is-active" : ""}`}
                    href={href}
                  >
                    {item.label[locale]}
                  </Link>
                );
              })}
            </nav>
            <div className="site-header__actions">
              <LanguageSwitcher label={copy.languageLabel} locale={locale} />
              <Link className="button button--primary button--small" href={withLocale(locale, "/contact")}>
                <span>{copy.primaryCta}</span>
                <ArrowRightIcon className="button__icon" />
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
